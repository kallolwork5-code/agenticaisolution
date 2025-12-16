"""
File Upload API with AI Classification and Dual Storage
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import json
import pandas as pd
from datetime import datetime
import uuid
from pathlib import Path

from app.db.database import SessionLocal
from app.db.models import Prompt
from app.agents.data_classifier import DataClassificationAgent
from app.services.storage_service import StorageService
from app.services.websocket_service import WebSocketManager
from app.vectorstore.chroma_client import get_collection
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

router = APIRouter(prefix="/api/upload")

# WebSocket manager for real-time updates
websocket_manager = WebSocketManager()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FileProcessor:
    """Process different file types and extract data"""
    
    @staticmethod
    def process_csv(file_path: str) -> dict:
        """Process CSV files"""
        try:
            df = pd.read_csv(file_path)
            return {
                "data": df.to_dict('records'),
                "columns": df.columns.tolist(),
                "row_count": len(df),
                "sample_data": df.head(5).to_dict('records'),
                "data_types": df.dtypes.to_dict()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing CSV: {str(e)}")
    
    @staticmethod
    def process_excel(file_path: str) -> dict:
        """Process Excel files"""
        try:
            df = pd.read_excel(file_path)
            return {
                "data": df.to_dict('records'),
                "columns": df.columns.tolist(),
                "row_count": len(df),
                "sample_data": df.head(5).to_dict('records'),
                "data_types": df.dtypes.to_dict()
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing Excel: {str(e)}")
    
    @staticmethod
    def process_json(file_path: str) -> dict:
        """Process JSON files"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            if isinstance(data, list):
                return {
                    "data": data,
                    "row_count": len(data),
                    "sample_data": data[:5] if len(data) > 5 else data,
                    "structure": "array"
                }
            else:
                return {
                    "data": data,
                    "structure": "object",
                    "keys": list(data.keys()) if isinstance(data, dict) else []
                }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing JSON: {str(e)}")
    
    @staticmethod
    def process_text(file_path: str) -> dict:
        """Process text files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split into chunks for analysis
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            chunks = text_splitter.split_text(content)
            
            return {
                "content": content,
                "chunks": chunks,
                "word_count": len(content.split()),
                "char_count": len(content),
                "chunk_count": len(chunks)
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing text: {str(e)}")

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    prompt_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Upload and process a file with AI classification
    """
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Create upload directory
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        file_path = upload_dir / f"{file_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Send initial WebSocket update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "upload",
            "progress": 100,
            "message": f"File {file.filename} uploaded successfully"
        })
        
        # Process file based on type
        file_extension = Path(file.filename).suffix.lower()
        processor = FileProcessor()
        
        if file_extension in ['.csv']:
            processed_data = processor.process_csv(str(file_path))
        elif file_extension in ['.xlsx', '.xls']:
            processed_data = processor.process_excel(str(file_path))
        elif file_extension in ['.json']:
            processed_data = processor.process_json(str(file_path))
        elif file_extension in ['.txt', '.md']:
            processed_data = processor.process_text(str(file_path))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")
        
        # Send analysis update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "analyze",
            "progress": 100,
            "message": "File analysis completed"
        })
        
        # Initialize classification agent
        classifier = DataClassificationAgent(db, websocket_manager)
        
        # Get selected prompt if provided
        selected_prompt = None
        if prompt_id:
            selected_prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
        
        # Classify the data
        classification_result = await classifier.classify_data(
            file_data=processed_data,
            file_name=file.filename,
            file_size=len(content),
            prompt=selected_prompt
        )
        
        # Send classification update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "classify",
            "progress": 100,
            "message": f"Data classified as: {classification_result['data_type']}"
        })
        
        # Store data based on classification
        storage_service = StorageService(db)
        storage_result = await storage_service.store_data(
            file_id=file_id,
            file_name=file.filename,
            file_size=len(content),
            processed_data=processed_data,
            classification=classification_result,
            websocket_manager=websocket_manager
        )
        
        # Send completion update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "complete",
            "progress": 100,
            "message": "Upload and processing completed successfully"
        })
        
        # Clean up temporary file
        os.remove(file_path)
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(content),
            "classification": classification_result,
            "storage": storage_result,
            "processed_data": {
                "row_count": processed_data.get("row_count", 0),
                "columns": processed_data.get("columns", []),
                "sample_data": processed_data.get("sample_data", [])
            }
        }
        
    except Exception as e:
        # Send error update
        await websocket_manager.send_progress_update({
            "file_id": file_id if 'file_id' in locals() else "unknown",
            "stage": "error",
            "progress": 0,
            "message": f"Error: {str(e)}"
        })
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        websocket_manager.disconnect(client_id)

@router.get("/history")
async def get_upload_history(db: Session = Depends(get_db)):
    """Get upload history with insights"""
    # This will be implemented to fetch from database
    # For now, return the mock data from insights API
    from app.api.insights import get_upload_history as get_mock_history
    return get_mock_history()