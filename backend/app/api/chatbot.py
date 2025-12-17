from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime

from ..services.chatbot_service import ChatbotService
from ..core.auth import get_current_user

router = APIRouter()

class ChatMessage(BaseModel):
    id: str
    type: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    context: Optional[List[str]] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: ChatMessage
    conversation_id: str
    status: str

class ChatHistoryResponse(BaseModel):
    conversation_id: str
    messages: List[ChatMessage]
    status: str

# Initialize chatbot service
chatbot_service = ChatbotService()

@router.post("/chat", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the AI chatbot and get a response"""
    try:
        response = await chatbot_service.process_message(
            message=request.message,
            conversation_id=request.conversation_id,
            user_id=current_user.get("user_id"),
            context=request.context
        )
        
        return ChatResponse(
            message=response["message"],
            conversation_id=response["conversation_id"],
            status="success"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

@router.post("/chat/stream")
async def send_message_stream(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the AI chatbot and get a streaming response"""
    try:
        async def generate_response():
            async for chunk in chatbot_service.process_message_stream(
                message=request.message,
                conversation_id=request.conversation_id,
                user_id=current_user.get("user_id"),
                context=request.context
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")

@router.get("/chat/history/{conversation_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get chat history for a conversation"""
    try:
        history = await chatbot_service.get_conversation_history(
            conversation_id=conversation_id,
            user_id=current_user.get("user_id")
        )
        
        return ChatHistoryResponse(
            conversation_id=conversation_id,
            messages=history,
            status="success"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History error: {str(e)}")

@router.post("/chat/new")
async def start_new_conversation(
    current_user: dict = Depends(get_current_user)
):
    """Start a new chat conversation"""
    try:
        conversation_id = await chatbot_service.create_new_conversation(
            user_id=current_user.get("user_id")
        )
        
        return {
            "conversation_id": conversation_id,
            "status": "success",
            "message": "New conversation started"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversation creation error: {str(e)}")

@router.delete("/chat/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a chat conversation"""
    try:
        await chatbot_service.delete_conversation(
            conversation_id=conversation_id,
            user_id=current_user.get("user_id")
        )
        
        return {
            "status": "success",
            "message": "Conversation deleted"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion error: {str(e)}")

@router.get("/chat/capabilities")
async def get_chatbot_capabilities():
    """Get information about chatbot capabilities"""
    return {
        "capabilities": [
            "Payment transaction analysis",
            "Cost savings calculations", 
            "SLA compliance monitoring",
            "Routing optimization insights",
            "MDR rate comparisons",
            "Error analysis and recommendations"
        ],
        "sample_questions": [
            "What are my total cost savings this month?",
            "Which transactions had SLA breaches?",
            "Show me routing errors for VISA transactions",
            "What's the average MDR rate for HDFC?",
            "Explain the cost impact of transaction TXN0002"
        ],
        "data_scope": [
            "Transaction records",
            "Rate card agreements", 
            "Routing rules",
            "Compliance violations",
            "Performance metrics"
        ]
    }