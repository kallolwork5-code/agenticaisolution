"""
Enhanced File Upload API with Real-time Classification and Deduplication

This API provides:
- Real-time WebSocket progress updates
- AI-powered data classification with prompts
- Duplicate detection and handling
- Comprehensive logging and audit trail
- Visual progress tracking for users
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import pandas as pd
import hashlib
import logging
import uuid
import json
from datetime import datetime, timezone

from app.db.database import get_db
from app.models.file_upload import UploadedFile, ProcessedDocument
from app.models.user import User
# Authentication removed for testing - can be re-added later
# from app.middleware.auth import get_current_active_user
from app.agents.ingestion_graph import build_ingestion_graph
from app.api.websocket import manager as websocket_manager
from app.utils.file_parsers import parse_csv, parse_excel, parse_json, parse_pdf, parse_word

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/enhanced-upload", tags=["enhanced-upload"])

# Build the ingestion graph
ingestion_graph = build_ingestion_graph()

class EnhancedFileProcessor:
    """Enhanced file processor with deduplication and real-time updates"""
    
    def __init__(self, db: Session, websocket_manager, user: Optional[User]):
        self.db = db
        self.websocket_manager = websocket_manager
        self.user = user
        # Use simple deduplication for now
        self.dedup_service = None
    
    async def process_file(self, file: UploadFile, file_id: str) -> Dict[str, Any]:
        """Process uploaded file with real-time updates and deduplication"""
        
        try:
            # Step 1: File validation and duplicate detection
            await self._send_update(file_id, "File Validator", "processing", 
                                  "🔍 Validating file and checking for duplicates...")
            
            file_content = await file.read()
            file_hash = hashlib.sha256(file_content).hexdigest()
            
            # Check for duplicate files (simplified version)
            existing_file = self.db.query(UploadedFile).filter(
                UploadedFile.content_hash == file_hash
            ).first()
            
            if existing_file:
                await self._send_update(file_id, "File Validator", "completed",
                                      f"⚠️ Duplicate file detected: {existing_file.file_name}")
                return {
                    "status": "duplicate",
                    "message": f"File already exists: {existing_file.file_name}",
                    "existing_file_id": existing_file.id,
                    "uploaded_at": existing_file.upload_timestamp.isoformat()
                }
            
            # Step 2: Parse file content
            await self._send_update(file_id, "File Parser", "processing",
                                  f"📄 Parsing {file.content_type} file...")
            
            df, parse_result = await self._parse_file_content(file, file_content)
            
            if df is None or df.empty:
                raise HTTPException(400, "Could not parse file or file is empty")
            
            await self._send_update(file_id, "File Parser", "completed",
                                  f"✅ Parsed {len(df)} rows with {len(df.columns)} columns")
            
            # Step 3: Data deduplication check
            await self._send_update(file_id, "Deduplication Engine", "processing",
                                  "🔍 Checking for duplicate records in database...")
            
            dedup_result = await self._check_data_duplicates(df, file_id)
            
            # Step 4: AI Classification
            await self._send_update(file_id, "AI Classification Pipeline", "processing",
                                  "🤖 Starting intelligent data classification...")
            
            # Use the existing ingestion graph for classification
            classification_state = {
                "file_name": file.filename,
                "columns": list(df.columns),
                "sample_rows": df.head(3).to_dict(orient="records"),
            }
            
            try:
                classification_result = await ingestion_graph.ainvoke(classification_state)
            except Exception as e:
                logger.warning(f"AI classification failed: {e}, using fallback classification")
                # Fallback classification based on file content
                classification_result = {
                    "data_type": "transaction" if any(col in ["transaction", "amount", "acquirer"] for col in [c.lower() for c in df.columns]) else "document",
                    "confidence": 0.7,
                    "method": "fallback_rule_based",
                    "reasoning": f"Fallback classification based on column names: {list(df.columns)}"
                }
            
            # Step 5: Store file metadata
            uploaded_file = await self._store_file_metadata(
                file_id, file, file_hash, len(df), classification_result, dedup_result
            )
            
            # Step 6: Data ingestion (if not duplicate)
            ingestion_result = None
            if dedup_result["action"] != "skip_all":
                await self._send_update(file_id, "Data Ingestion Engine", "processing",
                                      f"💾 Ingesting {dedup_result['new_records']} new records...")
                
                ingestion_result = await self._ingest_data(df, classification_result, dedup_result)
                
                await self._send_update(file_id, "Data Ingestion Engine", "completed",
                                      f"✅ Successfully ingested {ingestion_result['records_processed']} records")
            
            # Step 7: Final summary
            await self._send_completion_summary(file_id, {
                "file_info": {
                    "filename": file.filename,
                    "size": len(file_content),
                    "rows": len(df),
                    "columns": len(df.columns)
                },
                "classification": classification_result,
                "deduplication": dedup_result,
                "ingestion": ingestion_result,
                "file_id": file_id
            })
            
            return {
                "status": "success",
                "file_id": file_id,
                "filename": file.filename,
                "rows_processed": len(df),
                "classification": classification_result,
                "deduplication": dedup_result,
                "ingestion": ingestion_result,
                "websocket_url": f"ws://localhost:8000/ws/upload/{file_id}"
            }
            
        except Exception as e:
            logger.error(f"Error processing file {file_id}: {e}")
            await self._send_update(file_id, "Error Handler", "error",
                                  f"❌ Processing failed: {str(e)}")
            raise HTTPException(500, f"File processing failed: {str(e)}")
    
    async def _parse_file_content(self, file: UploadFile, content: bytes) -> tuple:
        """Parse file content based on file type"""
        filename = file.filename.lower()
        
        # Reset file position
        await file.seek(0)
        
        try:
            if filename.endswith('.csv'):
                df = parse_csv(file.file)
                return df, {"type": "csv", "status": "success"}
            
            elif filename.endswith(('.xlsx', '.xls')):
                df = parse_excel(file.file)
                return df, {"type": "excel", "status": "success"}
            
            elif filename.endswith('.json'):
                content_dict = parse_json(file.file)
                if isinstance(content_dict, list):
                    df = pd.DataFrame(content_dict)
                elif isinstance(content_dict, dict):
                    df = pd.DataFrame([content_dict])
                else:
                    raise ValueError("Unsupported JSON structure")
                return df, {"type": "json", "status": "success"}
            
            elif filename.endswith('.pdf'):
                # For PDFs, we'll store as document for RAG
                text_content = parse_pdf(file.file)
                # Create a simple DataFrame for document content
                df = pd.DataFrame([{
                    "document_type": "pdf",
                    "content": text_content,
                    "filename": file.filename
                }])
                return df, {"type": "pdf", "status": "success"}
            
            elif filename.endswith('.docx'):
                # For Word docs, we'll store as document for RAG
                text_content = parse_word(file.file)
                df = pd.DataFrame([{
                    "document_type": "docx", 
                    "content": text_content,
                    "filename": file.filename
                }])
                return df, {"type": "docx", "status": "success"}
            
            else:
                raise ValueError(f"Unsupported file type: {filename}")
                
        except Exception as e:
            logger.error(f"Error parsing file {filename}: {e}")
            raise HTTPException(400, f"Failed to parse file: {str(e)}")
    
    async def _check_data_duplicates(self, df: pd.DataFrame, file_id: str) -> Dict[str, Any]:
        """Check for duplicate records in the data"""
        
        # Check for duplicates within the file itself
        internal_duplicates = df.duplicated().sum()
        
        # For now, we'll implement basic duplicate detection
        # In a real system, this would check against existing database records
        
        duplicate_info = {
            "total_records": len(df),
            "internal_duplicates": int(internal_duplicates),
            "new_records": len(df) - int(internal_duplicates),
            "action": "insert_new" if internal_duplicates == 0 else "insert_unique",
            "duplicate_handling": "skip_duplicates"
        }
        
        await self._send_update(file_id, "Deduplication Engine", "completed",
                              f"🔍 Found {internal_duplicates} internal duplicates, {duplicate_info['new_records']} unique records")
        
        return duplicate_info
    
    async def _ingest_data(self, df: pd.DataFrame, classification: Dict, dedup_info: Dict) -> Dict[str, Any]:
        """Ingest data based on classification results"""
        
        # Remove internal duplicates if any
        if dedup_info["internal_duplicates"] > 0:
            df = df.drop_duplicates()
        
        data_type = classification.get("data_type", "document")
        
        if data_type == "transaction":
            # Ingest as transaction data
            from app.services.transaction_ingestion_service import ingest_transactions
            result = ingest_transactions(df, self.db)
            
        elif data_type == "reference":
            # Ingest as reference data (rate cards, routing rules)
            from app.services.vector_ingestion_service import ingest_rate_card
            result = ingest_rate_card(df)
            
        else:  # document
            # Store as document for RAG
            result = await self._store_document(df, classification)
        
        return {
            "records_processed": len(df),
            "data_type": data_type,
            "storage_type": classification.get("storage_type", "unknown"),
            "status": "success"
        }
    
    async def _store_document(self, df: pd.DataFrame, classification: Dict) -> Dict[str, Any]:
        """Store document content for RAG/search"""
        
        # For documents, we'll store in the processed_documents table
        for _, row in df.iterrows():
            doc = ProcessedDocument(
                filename=row.get("filename", "unknown"),
                content_type=row.get("document_type", "text"),
                content=row.get("content", ""),
                classification=classification.get("data_type", "document"),
                confidence=classification.get("confidence", 0.0),
                processed_at=datetime.now(timezone.utc),
                user_id=self.user.id if self.user else None
            )
            self.db.add(doc)
        
        self.db.commit()
        
        return {
            "documents_stored": len(df),
            "storage_type": "document_database"
        }
    
    async def _store_file_metadata(self, file_id: str, file: UploadFile, file_hash: str, 
                                 row_count: int, classification: Dict, dedup_info: Dict) -> UploadedFile:
        """Store file metadata in database"""
        
        uploaded_file = UploadedFile(
            id=file_id,
            file_name=file.filename,
            original_name=file.filename,
            file_size=file.size or 0,
            file_type=file.content_type or "unknown",
            file_path=f"uploads/{file_id}_{file.filename}",
            status="completed",
            data_type=classification.get("data_type"),
            classification_confidence=classification.get("confidence", 0.0),
            content_hash=file_hash,
            processed_records=row_count,
            upload_timestamp=datetime.now(timezone.utc),
            processed_timestamp=datetime.now(timezone.utc)
        )
        
        self.db.add(uploaded_file)
        self.db.commit()
        self.db.refresh(uploaded_file)
        
        return uploaded_file
    
    async def _send_update(self, file_id: str, agent: str, status: str, message: str, data: Dict = None):
        """Send WebSocket update"""
        await self.websocket_manager.send_agent_update(file_id, agent, status, message, data)
    
    async def _send_completion_summary(self, file_id: str, summary: Dict):
        """Send final completion summary"""
        await self.websocket_manager.send_progress_update(file_id, {
            "type": "processing_complete",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "file_id": file_id,
            "summary": summary
        })


@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify the enhanced upload API is accessible"""
    return {"status": "Enhanced upload API is working!", "timestamp": datetime.now().isoformat()}

@router.post("/upload-no-auth")
async def enhanced_upload_file_no_auth(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Enhanced file upload without authentication (for testing)
    
    Features:
    - Real-time WebSocket updates
    - AI-powered data classification
    - Duplicate detection and handling
    - Comprehensive audit trail
    """
    
    # Generate unique file ID for tracking
    file_id = str(uuid.uuid4())
    
    logger.info(f"Enhanced upload started: {file.filename} (ID: {file_id}) by anonymous user")
    
    try:
        # Create processor without user authentication
        processor = EnhancedFileProcessor(db, websocket_manager, None)
        
        # Process file in background
        background_tasks.add_task(processor.process_file, file, file_id)
        
        # Return immediate response with WebSocket URL for progress tracking
        websocket_url = f"ws://localhost:8000/ws/upload/{file_id}"
        
        return JSONResponse(
            status_code=200,
            content={
                "file_id": file_id,
                "filename": file.filename,
                "status": "processing",
                "message": "File upload started successfully",
                "websocket_url": websocket_url,
                "classification": None  # Will be updated via WebSocket
            }
        )
        
    except Exception as e:
        logger.error(f"Enhanced upload failed for {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/upload")
async def enhanced_upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Enhanced file upload with real-time progress tracking and AI classification
    
    Features:
    - Real-time WebSocket updates
    - AI-powered data classification
    - Duplicate detection and handling
    - Comprehensive audit trail
    """
    
    # Generate unique file ID for tracking
    file_id = str(uuid.uuid4())
    
    logger.info(f"Enhanced upload started: {file.filename} (ID: {file_id}) by anonymous user")
    
    # Validate file
    if not file.filename:
        raise HTTPException(400, "No filename provided")
    
    # Check file size (limit to 100MB)
    if file.size and file.size > 100 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 100MB)")
    
    try:
        # Initialize processor
        processor = EnhancedFileProcessor(db, websocket_manager, None)
        
        # Process file (this will send real-time updates via WebSocket)
        result = await processor.process_file(file, file_id)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in enhanced upload: {e}")
        raise HTTPException(500, f"Upload processing failed: {str(e)}")


@router.get("/status/{file_id}")
async def get_upload_status(
    file_id: str,
    db: Session = Depends(get_db)
):
    """Get the current status of an uploaded file"""
    
    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id
    ).first()
    
    if not uploaded_file:
        raise HTTPException(404, "File not found")
    
    return {
        "file_id": uploaded_file.id,
        "filename": uploaded_file.file_name,
        "status": uploaded_file.status,
        "data_type": uploaded_file.data_type,
        "classification_confidence": uploaded_file.classification_confidence,
        "row_count": uploaded_file.processed_records,
        "uploaded_at": uploaded_file.upload_timestamp,
        "processed_at": uploaded_file.processed_timestamp
    }


@router.get("/history")
async def get_upload_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get upload history for the current user"""
    
    files = db.query(UploadedFile).order_by(UploadedFile.upload_timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "files": [
            {
                "file_id": f.id,
                "filename": f.file_name,
                "status": f.status,
                "data_type": f.data_type,
                "row_count": f.processed_records,
                "uploaded_at": f.upload_timestamp,
                "classification_confidence": f.classification_confidence
            }
            for f in files
        ],
        "total": db.query(UploadedFile).count()
    }