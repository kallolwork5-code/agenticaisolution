"""
Simple auth module for demo purposes
"""

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
from typing import Optional, Dict, Any

security = HTTPBearer(auto_error=False)

async def get_current_user(token: Optional[str] = Depends(security)) -> Dict[str, Any]:
    """
    Simple auth bypass for demo - returns a default user
    In production, this would validate JWT tokens
    """
    # For demo purposes, return a default user
    return {
        "user_id": "demo_user_001",
        "username": "demo_user",
        "email": "demo@example.com"
    }

def get_current_user_optional(token: Optional[str] = Depends(security)) -> Optional[Dict[str, Any]]:
    """
    Optional auth - returns None if no token provided
    """
    if not token:
        return None
    
    return {
        "user_id": "demo_user_001", 
        "username": "demo_user",
        "email": "demo@example.com"
    }