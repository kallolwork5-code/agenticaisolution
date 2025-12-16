"""
WebSocket endpoints for real-time progress tracking and agentic updates.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, file_id: str):
        await websocket.accept()
        if file_id not in self.active_connections:
            self.active_connections[file_id] = []
        self.active_connections[file_id].append(websocket)
        logger.info(f"WebSocket connected for file {file_id}")
    
    def disconnect(self, websocket: WebSocket, file_id: str):
        if file_id in self.active_connections:
            self.active_connections[file_id].remove(websocket)
            if not self.active_connections[file_id]:
                del self.active_connections[file_id]
        logger.info(f"WebSocket disconnected for file {file_id}")
    
    async def send_progress_update(self, file_id: str, message: dict):
        if file_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[file_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message: {e}")
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected:
                self.active_connections[file_id].remove(conn)
    
    async def send_agent_update(self, file_id: str, agent_name: str, status: str, message: str, data: dict = None):
        """Send agentic updates with detailed information"""
        update = {
            "type": "agent_update",
            "timestamp": datetime.utcnow().isoformat(),
            "file_id": file_id,
            "agent": agent_name,
            "status": status,  # starting, processing, completed, error
            "message": message,
            "data": data or {}
        }
        await self.send_progress_update(file_id, update)
    
    async def send_classification_update(self, file_id: str, classification_result: dict):
        """Send classification results with confidence and reasoning"""
        update = {
            "type": "classification_result",
            "timestamp": datetime.utcnow().isoformat(),
            "file_id": file_id,
            "data_type": classification_result.get("data_type"),
            "confidence": classification_result.get("confidence", 0.0),
            "reasoning": classification_result.get("reasoning", ""),
            "method": classification_result.get("method", "unknown"),  # rule-based or llm
            "schema": classification_result.get("schema", {})
        }
        await self.send_progress_update(file_id, update)
    
    async def send_ingestion_update(self, file_id: str, ingestion_result: dict):
        """Send ingestion results with detailed statistics"""
        update = {
            "type": "ingestion_result",
            "timestamp": datetime.utcnow().isoformat(),
            "file_id": file_id,
            "status": ingestion_result.get("status"),
            "records_processed": ingestion_result.get("records_processed", 0),
            "table_name": ingestion_result.get("table_name"),
            "duplicate_info": ingestion_result.get("duplicate_info"),
            "message": ingestion_result.get("message", "")
        }
        await self.send_progress_update(file_id, update)

# Global connection manager
manager = ConnectionManager()

@router.websocket("/ws/upload/{file_id}")
async def websocket_upload_progress(websocket: WebSocket, file_id: str):
    """WebSocket endpoint for real-time upload progress tracking"""
    await manager.connect(websocket, file_id)
    try:
        # Send initial connection confirmation
        await manager.send_progress_update(file_id, {
            "type": "connection_established",
            "timestamp": datetime.utcnow().isoformat(),
            "file_id": file_id,
            "message": "WebSocket connection established"
        })
        
        # Keep connection alive
        while True:
            try:
                # Wait for any message from client (ping/pong)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                
                # Handle ping/pong
                if data == "ping":
                    await websocket.send_text("pong")
                    
            except asyncio.TimeoutError:
                # Send heartbeat
                await manager.send_progress_update(file_id, {
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, file_id)
    except Exception as e:
        logger.error(f"WebSocket error for file {file_id}: {e}")
        manager.disconnect(websocket, file_id)

# Export the manager for use in other modules
__all__ = ["router", "manager"]