"""
Authentication schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    username: str
    email: Optional[str] = None
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserProfile


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class StatusResponse(BaseModel):
    message: str
    status: str = "success"