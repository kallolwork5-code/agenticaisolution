from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import os
import shutil
from pathlib import Path
import json
import uuid
from datetime import datetime
import logging

from ..agents.data_classifier import DataClassificationAgent
from ..agents.data_ingestion import DataIngestionAgent
from ..agents.document_processor import DocumentProcessingAgent
from ..models.file_upload import UploadedFile, DataSchema, ProcessedDocument, UploadHistory
from ..db.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/files", tags=["file-upload"])

# Initialize agents
classifier_agent = DataClassificationAgent()
ingestion_agent = DataIngestionAgent()
document_processor = DocumentProcessingAgent()

# Upload directory
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload and process a file with automatic schema detection and classification
    """
    try:
        # Parse metadata if provided
        file_metadata = {}
        if metadata:
            try:
                file_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                logger.warning("Invalid metadata JSON provided")
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save uploaded file
        file_extension = Path(file.filename).suffix.lower()
        saved_filename = f"{file_id}{file_extension}"
        file_path = UPLOAD_DIR / saved_filename
        
        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file info
        file_size = file_path.stat().st_size
        file_type = file.content_type or "application/octet-stream"
        
        # Create database record
        db_file = UploadedFile(
            id=file_id,
            file_name=saved_filename,
            original_name=file.filename,
            file_size=file_size,
            file_type=file_type,
            file_path=str(file_path),
            status='uploaded',
            upload_timestamp=datetime.utcnow()
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        # Start background processing
        background_tasks.add_task(
            process_file_background,
            file_id=file_id,
            file_path=str(file_path),
            metadata=file_metadata
        )
        
        return JSONResponse(
            status_code=200,
            content={
                'file_id': file_id,
                'filename': file.filename,
                'size': file_size,
                'type': file_type,
                'status': 'uploaded',
                'message': 'File uploaded successfully. Processing started in background.'
            }
        )
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_file_background(file_id: str, file_path: str, metadata: Dict):
    """
    Background task to process uploaded file
    """
    from ..db.database import SessionLocal
    
    db = SessionLocal()
    try:
        logger.info(f"Starting background processing for file {file_id}")
        
        # Get file record from database
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not db_file:
            logger.error(f"File record not found for {file_id}")
            return
        
        # Update status to processing
        db_file.status = 'processing'
        db_file.processing_progress = 10
        db.commit()
        
        # Step 1: Classify the file
        classification_result = classifier_agent.classify_file(
            file_path=file_path,
            file_name=db_file.original_name,
            file_type=db_file.file_type
        )
        
        if classification_result.get('data_type') == 'error':
            logger.error(f"Classification failed for {file_id}: {classification_result.get('error')}")
            db_file.status = 'error'
            db_file.error_message = classification_result.get('error', 'Classification failed')
            db.commit()
            return
        
        # Update file with classification results
        db_file.data_type = classification_result['data_type']
        db_file.classification_confidence = classification_result.get('confidence', 0.0)
        
        # Properly serialize schema to JSON
        schema = classification_result.get('schema', {})
        if schema:
            import json
            try:
                # Convert any non-JSON serializable objects to strings
                db_file.detected_schema = json.loads(json.dumps(schema, default=str))
            except Exception as e:
                logger.warning(f"Error serializing schema: {str(e)}")
                db_file.detected_schema = {}
        else:
            db_file.detected_schema = {}
            
        db_file.content_hash = classification_result.get('content_hash')
        db_file.processing_progress = 30
        db.commit()
        
        # Step 2: Process based on classification
        if classification_result['data_type'] in ['reference', 'transaction']:
            # Process structured data
            await process_structured_data(file_id, file_path, classification_result, db)
        
        elif classification_result['data_type'] == 'document':
            # Process document for RAG
            await process_document_data(file_id, file_path, classification_result, db)
        
        else:
            logger.warning(f"Unknown data type for file {file_id}: {classification_result['data_type']}")
            db_file.status = 'error'
            db_file.error_message = f"Unknown data type: {classification_result['data_type']}"
            db.commit()
            return
        
        # Mark as completed (only if not already in a final state)
        if db_file.status not in ['duplicate', 'error']:
            db_file.status = 'completed'
            db_file.processing_progress = 100
        db_file.processed_timestamp = datetime.utcnow()
        db.commit()
        
        logger.info(f"Completed processing for file {file_id}")
        
    except Exception as e:
        logger.error(f"Error in background processing for {file_id}: {str(e)}")
        # Update database with error
        try:
            db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
            if db_file:
                db_file.status = 'error'
                db_file.error_message = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

async def process_structured_data(file_id: str, file_path: str, classification: Dict, db: Session):
    """Process structured data (Excel/CSV) into SQLite"""
    try:
        # Get file record
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not db_file:
            return
        
        # Generate table name
        table_name = classifier_agent.suggest_table_name(
            db_file.original_name, 
            classification['data_type']
        )
        
        # Update progress
        db_file.processing_progress = 50
        db_file.table_name = table_name
        db.commit()
        
        # Ingest data
        ingestion_result = ingestion_agent.ingest_structured_data(
            file_path=file_path,
            schema=classification['schema'],
            table_name=table_name,
            file_id=file_id,
            content_hash=classification['content_hash'],
            original_filename=db_file.original_name
        )
        
        logger.info(f"Structured data processing result for {file_id}: {ingestion_result}")
        
        # Update database with results
        if ingestion_result.get('status') == 'success':
            db_file.processed_records = ingestion_result.get('records_processed', 0)
            db_file.processing_progress = 90
        elif ingestion_result.get('status') == 'duplicate':
            # Handle duplicate files
            db_file.status = 'duplicate'
            db_file.is_duplicate = True
            duplicate_info = ingestion_result.get('duplicate_info', {})
            db_file.original_file_id = duplicate_info.get('original_file_id')
            db_file.error_message = ingestion_result.get('message', 'File is a duplicate')
            db_file.processing_progress = 100  # Mark as complete since it's processed (as duplicate)
        else:
            db_file.status = 'error'
            db_file.error_message = ingestion_result.get('message', 'Data ingestion failed')
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error processing structured data: {str(e)}")
        raise

async def process_document_data(file_id: str, file_path: str, classification: Dict, db: Session):
    """Process document data (PDF/Word) for RAG"""
    try:
        # Get file record
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not db_file:
            return
        
        # Update progress
        db_file.processing_progress = 50
        db.commit()
        
        # Process document
        processing_result = document_processor.process_document(
            file_path=file_path,
            file_name=db_file.original_name,
            file_type=db_file.file_type,
            file_id=file_id,
            content_hash=classification['content_hash']
        )
        
        logger.info(f"Document processing result for {file_id}: {processing_result}")
        
        # Update database with results
        if processing_result.get('status') == 'success':
            db_file.processed_records = processing_result.get('chunks_processed', 0)
            db_file.processing_progress = 90
        else:
            db_file.status = 'error'
            db_file.error_message = processing_result.get('message', 'Document processing failed')
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise

@router.get("/status/{file_id}")
async def get_file_status(file_id: str, db: Session = Depends(get_db)):
    """Get processing status of an uploaded file"""
    try:
        # Query the database for real file status
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {
            'file_id': file_id,
            'filename': db_file.original_name,
            'status': db_file.status,
            'progress': db_file.processing_progress,
            'data_type': db_file.data_type,
            'table_name': db_file.table_name,
            'processed_records': db_file.processed_records,
            'upload_timestamp': db_file.upload_timestamp.isoformat() if db_file.upload_timestamp else None,
            'processed_timestamp': db_file.processed_timestamp.isoformat() if db_file.processed_timestamp else None,
            'error_message': db_file.error_message,
            'file_size': db_file.file_size,
            'classification_confidence': db_file.classification_confidence
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting file status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_uploaded_files(db: Session = Depends(get_db)):
    """List all uploaded files"""
    try:
        # Get all uploaded files from database
        db_files = db.query(UploadedFile).order_by(UploadedFile.upload_timestamp.desc()).all()
        
        # Convert to response format
        files = []
        for db_file in db_files:
            files.append({
                'id': db_file.id,
                'filename': db_file.original_name,
                'type': db_file.data_type or 'unknown',
                'status': db_file.status,
                'records': db_file.processed_records or 0,
                'file_size': db_file.file_size,
                'table_name': db_file.table_name,
                'uploaded_at': db_file.upload_timestamp.isoformat() if db_file.upload_timestamp else None,
                'processed_at': db_file.processed_timestamp.isoformat() if db_file.processed_timestamp else None,
                'progress': db_file.processing_progress,
                'error_message': db_file.error_message
            })
        
        # Get structured data tables
        tables = ingestion_agent.list_tables()
        
        return {
            'files': files,
            'tables': tables,
            'total_files': len(files)
        }
        
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_id}")
async def delete_file(file_id: str, db: Session = Depends(get_db)):
    """Delete an uploaded file and its processed data"""
    try:
        # Get file record from database
        db_file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # 1. Remove file from disk
        try:
            if os.path.exists(db_file.file_path):
                os.remove(db_file.file_path)
                logger.info(f"Deleted file from disk: {db_file.file_path}")
        except Exception as e:
            logger.warning(f"Could not delete file from disk: {str(e)}")
        
        # 2. Remove data from SQLite tables (if it's structured data)
        if db_file.table_name and db_file.data_type in ['reference', 'transaction']:
            try:
                ingestion_agent.delete_table_data(db_file.table_name, file_id)
                logger.info(f"Deleted table data for file {file_id}")
            except Exception as e:
                logger.warning(f"Could not delete table data: {str(e)}")
        
        # 3. Remove chunks from ChromaDB (if it's a document)
        if db_file.data_type == 'document':
            try:
                # Remove document chunks from ChromaDB
                collections = document_processor.chroma_client.list_collections()
                for collection in collections:
                    coll = document_processor.chroma_client.get_collection(collection.name)
                    # Delete chunks with matching file_id
                    results = coll.get(where={"file_id": file_id})
                    if results['ids']:
                        coll.delete(ids=results['ids'])
                        logger.info(f"Deleted {len(results['ids'])} chunks from ChromaDB")
            except Exception as e:
                logger.warning(f"Could not delete document chunks: {str(e)}")
        
        # 4. Remove database record
        db.delete(db_file)
        db.commit()
        
        return {
            'message': f'File {file_id} and all associated data deleted successfully',
            'filename': db_file.original_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_documents(query: str, collection: Optional[str] = None):
    """Search processed documents using RAG"""
    try:
        results = document_processor.search_documents(
            query=query,
            collection_name=collection,
            limit=5
        )
        
        return {
            'query': query,
            'results': results
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tables/{table_name}")
async def get_table_data(table_name: str, limit: int = 100, offset: int = 0):
    """Get data from a specific table"""
    try:
        # Get table info and actual data
        table_info = ingestion_agent.get_table_info(table_name)
        
        # Get actual table data with pagination
        table_data = ingestion_agent.get_table_data(table_name, limit=limit, offset=offset)
        
        return {
            'table_name': table_name,
            'table_info': table_info,
            'data': table_data.get('data', []),
            'columns': table_data.get('columns', []),
            'total_rows': table_info.get('row_count', 0),
            'returned_rows': len(table_data.get('data', [])),
            'limit': limit,
            'offset': offset
        }
        
    except Exception as e:
        logger.error(f"Error getting table data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))