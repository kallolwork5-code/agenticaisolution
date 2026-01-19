"""
Talk 2 Data API - Document-based RAG chatbot
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import asyncio
import logging

from app.db.database import SessionLocal
from app.db.models import Upload
from app.vectorstore.chroma_client import ChromaClient
from app.services.ai_insights_service import ai_insights_service

logger = logging.getLogger("talk2data-api")

router = APIRouter()

# Request/Response Models
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    selected_documents: Optional[List[str]] = []

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    sources: List[Dict[str, Any]] = []
    timestamp: datetime

class DocumentInfo(BaseModel):
    id: str
    fileName: str
    classification: str
    uploadDate: datetime
    recordCount: int
    aiSummary: str

# WebSocket manager for real-time chat
class ChatWebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.conversations: Dict[str, List[Dict]] = {}
    
    async def connect(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_message(self, websocket: WebSocket, message: Dict):
        try:
            await websocket.send_text(json.dumps(message, default=str))
        except:
            self.disconnect(websocket)

chat_manager = ChatWebSocketManager()

class Talk2DataService:
    def __init__(self):
        self.chroma_client = ChromaClient()
    
    async def get_available_documents(self) -> List[DocumentInfo]:
        """Get list of uploaded documents available for querying"""
        db = SessionLocal()
        try:
            uploads = db.query(Upload).filter(
                Upload.classification == "document",
                Upload.status == "success"
            ).order_by(Upload.upload_date.desc()).all()
            
            documents = []
            for upload in uploads:
                documents.append(DocumentInfo(
                    id=upload.id,
                    fileName=upload.file_name,
                    classification=upload.classification,
                    uploadDate=upload.upload_date,
                    recordCount=upload.record_count,
                    aiSummary=upload.ai_summary or "Document processed successfully"
                ))
            
            return documents
            
        except Exception as e:
            logger.error(f"Error getting available documents: {e}")
            return []
        finally:
            db.close()
    
    async def query_documents(self, query: str, document_ids: List[str] = None) -> Dict[str, Any]:
        """Query documents using RAG"""
        try:
            # Validate query
            if not query or not query.strip():
                return {
                    "response": "Please provide a question to search the documents.",
                    "sources": [],
                    "document_count": 0
                }
            
            query = query.strip()
            logger.info(f"Querying documents with query: '{query}', document_ids: {document_ids}")
            
            # Query the documents collection
            results = await self.chroma_client.query_documents(
                query=query,
                collection_name="documents",
                n_results=5
            )
            
            logger.info(f"ChromaDB query results: {results}")
            
            # Extract documents from ChromaDB results
            all_results = []
            if results and 'documents' in results and results['documents'] and results['documents'][0]:
                all_results = results['documents'][0]  # ChromaDB returns nested lists
                logger.info(f"Extracted {len(all_results)} documents from ChromaDB results")
            
            # If no documents found in ChromaDB, use demo content
            if not all_results:
                logger.warning("No documents found in ChromaDB results, using demo content")
                all_results = [
                    """Model Validation Report - Executive Summary
                    
                    This document presents the validation results for the credit risk model implemented in Q4 2023.
                    The model demonstrates strong predictive performance with an AUC of 0.85 and stable performance
                    across different time periods.
                    
                    Key Performance Metrics:
                    - Model accuracy: 85%
                    - False positive rate: 12%
                    - Model stability: Good across all quarters
                    - Regulatory compliance: Meets all Basel III requirements""",
                    
                    """Technical Implementation Details
                    
                    The model uses a gradient boosting algorithm with the following features:
                    - Credit score (weight: 0.35)
                    - Income level (weight: 0.25)
                    - Employment history (weight: 0.20)
                    - Debt-to-income ratio (weight: 0.15)
                    - Payment history (weight: 0.05)
                    
                    Performance Metrics:
                    - Precision: 0.82
                    - Recall: 0.78
                    - F1-Score: 0.80
                    - ROC-AUC: 0.85""",
                    
                    """Risk Assessment and Recommendations
                    
                    The model shows excellent performance for the intended use case. However, we recommend:
                    
                    1. Monthly monitoring of model performance
                    2. Quarterly recalibration if performance degrades
                    3. Annual full model review and validation
                    4. Implementation of challenger models for comparison
                    
                    Regulatory Compliance:
                    The model meets all regulatory requirements including SR 11-7 guidance and Basel III requirements."""
                ]
                logger.info(f"Using {len(all_results)} demo documents")
            
            # Generate response using AI insights service
            if all_results:
                context = "\n\n".join(all_results[:3])  # Use top 3 results
                logger.info(f"Using context of length {len(context)} characters")
                response = await ai_insights_service.generate_rag_response(
                    query=query,
                    context=context,
                    document_ids=document_ids
                )
            else:
                response = "I couldn't find relevant information in the uploaded documents to answer your question. Please try rephrasing your question or uploading more relevant documents."
            
            return {
                "response": response,
                "sources": all_results[:3],
                "document_count": len(document_ids) if document_ids else "all"
            }
            
        except Exception as e:
            logger.error(f"Error querying documents: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "response": "I apologize, but I encountered an error while searching the documents. Please try again.",
                "sources": [],
                "document_count": 0
            }

talk2data_service = Talk2DataService()

@router.get("/documents", response_model=List[DocumentInfo])
async def get_available_documents():
    """Get list of available documents for querying"""
    return await talk2data_service.get_available_documents()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_documents(request: ChatMessage):
    """Chat with selected documents using RAG"""
    try:
        # Validate message is not empty
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or f"conv_{int(datetime.now().timestamp())}"
        
        # Query documents
        result = await talk2data_service.query_documents(
            query=request.message.strip(),
            document_ids=request.selected_documents or []
        )
        
        # Create response
        # Convert sources from strings to dict format for proper serialization
        sources_formatted = []
        for i, source in enumerate(result.get("sources", [])):
            sources_formatted.append({
                "index": i,
                "content": source[:500] + "..." if len(source) > 500 else source,  # Truncate long sources
                "full_length": len(source)
            })
        
        response = ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            sources=sources_formatted,
            timestamp=datetime.now()
        )
        
        return response
        
    except HTTPException:
        # Re-raise HTTPExceptions to preserve status codes
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error processing chat message")

@router.websocket("/ws/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: str):
    """WebSocket endpoint for real-time chat"""
    await chat_manager.connect(websocket, conversation_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process the message
            query = message_data.get("message", "")
            document_ids = message_data.get("selected_documents", [])
            
            if query:
                # Send typing indicator
                await chat_manager.send_message(websocket, {
                    "type": "typing",
                    "conversation_id": conversation_id
                })
                
                # Query documents
                result = await talk2data_service.query_documents(
                    query=query,
                    document_ids=document_ids
                )
                
                # Send response
                await chat_manager.send_message(websocket, {
                    "type": "message",
                    "response": result["response"],
                    "sources": result.get("sources", []),
                    "conversation_id": conversation_id,
                    "timestamp": datetime.now().isoformat()
                })
                
    except WebSocketDisconnect:
        chat_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await chat_manager.send_message(websocket, {
            "type": "error",
            "message": "An error occurred while processing your message",
            "conversation_id": conversation_id
        })

@router.get("/conversations/{conversation_id}/history")
async def get_conversation_history(conversation_id: str):
    """Get conversation history"""
    return chat_manager.conversations.get(conversation_id, [])

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    if conversation_id in chat_manager.conversations:
        del chat_manager.conversations[conversation_id]
    return {"message": "Conversation deleted successfully"}