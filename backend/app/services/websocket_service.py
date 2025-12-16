"""
WebSocket Service for real-time updates during file processing
"""

import json
from typing import Dict, Any, List
from fastapi import WebSocket
from datetime import datetime

class WebSocketManager:
    """
    Manages WebSocket connections for real-time updates
    """
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"WebSocket client {client_id} connected")
    
    def disconnect(self, client_id: str):
        """Disconnect a WebSocket client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"WebSocket client {client_id} disconnected")
    
    async def send_progress_update(self, data: Dict[str, Any]):
        """Send progress update to all connected clients"""
        message = {
            "type": "progress_update",
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self._broadcast(message)
    
    async def send_agent_thinking(self, thinking_data: Dict[str, Any]):
        """Send agent thinking update to all connected clients"""
        message = {
            "type": "agent_thinking",
            "data": thinking_data,
            "timestamp": datetime.now().isoformat()
        }
        await self._broadcast(message)
    
    async def send_classification_result(self, classification_data: Dict[str, Any]):
        """Send classification result to all connected clients"""
        message = {
            "type": "classification_result",
            "data": classification_data,
            "timestamp": datetime.now().isoformat()
        }
        await self._broadcast(message)
    
    async def send_storage_update(self, storage_data: Dict[str, Any]):
        """Send storage update to all connected clients"""
        message = {
            "type": "storage_update", 
            "data": storage_data,
            "timestamp": datetime.now().isoformat()
        }
        await self._broadcast(message)
    
    async def _broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
        
        message_str = json.dumps(message)
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error sending to client {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)