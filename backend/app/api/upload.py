"""
Upload API with real AI insights using LangChain
"""

from fastapi import APIRouter, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import asyncio
import os
import pandas as pd
import io
from app.services.ai_insights_service import ai_insights_service
from app.db.database import SessionLocal
from app.db.models import Upload
import logging

logger = logging.getLogger("upload-api")

router = APIRouter()

# WebSocket manager for real-time updates
class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_progress_update(self, stage: str, progress: int, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps({
                    "type": "progress",
                    "stage": stage,
                    "progress": progress,
                    "message": message,
                    "timestamp": datetime.now().isoformat()
                }))
            except:
                self.disconnect(connection)
    
    async def send_agent_update(self, thought_type: str, content: str, confidence: float, metadata: Dict = None):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps({
                    "type": "agent_thought",
                    "thought_type": thought_type,
                    "content": content,
                    "confidence": confidence,
                    "metadata": metadata or {},
                    "timestamp": datetime.now().isoformat()
                }))
            except:
                self.disconnect(connection)

websocket_manager = WebSocketManager()

@router.websocket("/ws/upload")
async def websocket_upload_progress(websocket: WebSocket):
    """WebSocket endpoint for real-time upload progress"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

@router.post("/process")
async def process_uploaded_file(file: UploadFile = File(...), prompt_id: Optional[str] = None):
    """Process uploaded file with real AI insights using LangChain"""
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        logger.info(f"Processing file: {file.filename} ({file_size} bytes)")
        
        # Send initial progress update
        await websocket_manager.send_progress_update(
            "upload", 20, f"File {file.filename} received ({file_size} bytes)"
        )
        
        # Parse file content based on type
        file_data = None
        file_content_preview = ""
        
        if file.filename.endswith('.csv'):
            file_data = pd.read_csv(io.BytesIO(content))
            file_content_preview = f"CSV with {len(file_data)} rows, {len(file_data.columns)} columns\\n"
            file_content_preview += f"Columns: {', '.join(file_data.columns)}\\n"
            file_content_preview += f"Sample data:\\n{file_data.head(3).to_string()}"
        elif file.filename.endswith(('.xlsx', '.xls')):
            file_data = pd.read_excel(io.BytesIO(content))
            file_content_preview = f"Excel with {len(file_data)} rows, {len(file_data.columns)} columns\\n"
            file_content_preview += f"Columns: {', '.join(file_data.columns)}\\n"
            file_content_preview += f"Sample data:\\n{file_data.head(3).to_string()}"
        elif file.filename.endswith('.json'):
            file_data = json.loads(content.decode('utf-8'))
            file_content_preview = json.dumps(file_data, indent=2)[:1500]
        else:
            # For other file types, treat as text
            file_data = content.decode('utf-8', errors='ignore')
            file_content_preview = str(file_data)[:1500]
        
        await websocket_manager.send_progress_update(
            "analyze", 40, "File parsed successfully, starting AI analysis"
        )
        
        # Generate real AI classification thoughts using LangChain
        classification_thoughts = await ai_insights_service.generate_classification_thoughts(
            file_content_preview, 
            file.filename,
            websocket_manager
        )
        
        await websocket_manager.send_progress_update(
            "classify", 60, "AI classification complete, determining storage strategy"
        )
        
        # Determine classification and storage location
        classification = "document"  # default
        confidence = 0.5
        method = "fallback"
        reasoning = "Default classification"
        
        # Extract classification from AI thoughts
        for thought in classification_thoughts:
            if thought['type'] == 'decision' and 'classification' in thought.get('metadata', {}):
                classification = thought['metadata']['classification']
                confidence = thought['confidence']
                method = "ai_analysis"
                reasoning = thought['content']
                break
        
        # Determine storage location based on classification
        if classification in ['transaction', 'rate_card', 'customer']:
            storage_location = 'sqlite'
        else:
            storage_location = 'chromadb'
        
        await websocket_manager.send_progress_update(
            "store", 80, f"Storing data in {storage_location.upper()}"
        )
        
        # Generate comprehensive data insights using LangChain
        data_insights = await ai_insights_service.generate_data_insights(
            file_data, 
            classification,
            websocket_manager
        )
        
        # Store the processed data
        upload_record = await store_upload_record({
            "file_name": file.filename,
            "file_size": file_size,
            "classification": classification,
            "storage_location": storage_location,
            "confidence": confidence,
            "method": method,
            "reasoning": reasoning,
            "record_count": len(file_data) if hasattr(file_data, '__len__') else 1,
            "status": "success",
            "ai_insights": data_insights
        })
        
        await websocket_manager.send_progress_update(
            "complete", 100, "Upload and AI analysis complete!"
        )
        
        # Send final completion thought
        await websocket_manager.send_agent_update(
            "decision",
            f"Processing complete! File classified as {classification} with {confidence:.1%} confidence and stored in {storage_location.upper()}.",
            confidence,
            {
                "classification": classification,
                "storage_location": storage_location,
                "method": method,
                "insights_count": len(data_insights)
            }
        )
        
        return {
            "success": True,
            "upload_id": upload_record,
            "classification": classification,
            "storage_location": storage_location,
            "confidence": confidence,
            "method": method,
            "reasoning": reasoning,
            "insights": data_insights,
            "record_count": len(file_data) if hasattr(file_data, '__len__') else 1
        }
        
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        await websocket_manager.send_progress_update(
            "error", 0, f"Error processing file: {str(e)}"
        )
        await websocket_manager.send_agent_update(
            "analysis",
            f"Processing failed: {str(e)}",
            0.1,
            {"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

async def store_upload_record(record_data: Dict[str, Any]) -> str:
    """Store upload record using SQLAlchemy models"""
    
    db = SessionLocal()
    try:
        upload_id = f"upload_{int(datetime.now().timestamp())}_{hash(record_data['file_name']) % 10000}"
        
        # Generate AI summary from insights
        ai_summary = generate_ai_summary(record_data.get('ai_insights', []), record_data['classification'])
        
        # Create new upload record
        upload_record = Upload(
            id=upload_id,
            file_name=record_data['file_name'],
            file_size=record_data['file_size'],
            classification=record_data['classification'],
            storage_location=record_data['storage_location'],
            confidence=record_data['confidence'],
            method=record_data['method'],
            reasoning=record_data['reasoning'],
            record_count=record_data['record_count'],
            status=record_data['status'],
            ai_summary=ai_summary,
            ai_insights=json.dumps(record_data.get('ai_insights', [])),
            prompt_used=record_data.get('prompt_used', 'default')
        )
        
        db.add(upload_record)
        db.commit()
        db.refresh(upload_record)
        
        return upload_id
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error storing upload record: {e}")
        raise
    finally:
        db.close()

def generate_ai_summary(insights: List[Dict], classification: str) -> str:
    """Generate a concise AI summary from insights"""
    if not insights:
        return f"Data classified as {classification} and processed successfully."
    
    # Extract key insights for summary
    quality_insights = [i for i in insights if i.get('type') == 'quality']
    recommendations = [i for i in insights if i.get('type') == 'recommendation']
    
    summary_parts = []
    
    if quality_insights:
        summary_parts.append(quality_insights[0].get('description', ''))
    
    if recommendations:
        summary_parts.append(f"Recommendation: {recommendations[0].get('description', '')}")
    
    if not summary_parts:
        summary_parts.append(f"AI analysis complete for {classification} data with {len(insights)} insights generated.")
    
    return " ".join(summary_parts)[:500]  # Limit summary length

@router.get("/history")
async def get_upload_history():
    """Get upload history from database with AI insights using SQLAlchemy"""
    
    db = SessionLocal()
    try:
        # Query uploads using SQLAlchemy
        uploads = db.query(Upload).order_by(Upload.upload_date.desc()).limit(50).all()
        
        history = []
        for upload in uploads:
            # Parse AI insights if available
            ai_insights = []
            try:
                if upload.ai_insights:
                    ai_insights = json.loads(upload.ai_insights)
            except Exception as e:
                logger.warning(f"Failed to parse AI insights for upload {upload.id}: {e}")
            
            history.append({
                "id": upload.id,
                "fileName": upload.file_name,
                "fileSize": upload.file_size,
                "uploadDate": upload.upload_date.isoformat(),
                "classification": upload.classification,
                "storageLocation": upload.storage_location,
                "confidence": upload.confidence,
                "method": upload.method,
                "reasoning": upload.reasoning,
                "recordCount": upload.record_count,
                "status": upload.status,
                "aiSummary": upload.ai_summary or f"Data classified as {upload.classification} with {upload.confidence:.1%} confidence using {upload.method} method.",
                "aiInsights": ai_insights,
                "promptUsed": upload.prompt_used
            })
        
        return history
        
    except Exception as e:
        logger.error(f"Error loading upload history: {e}")
        # Return empty list if database fails - no more dummy data
        return []
    finally:
        db.close()