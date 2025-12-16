"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    LoginRequest, AuthResponse, TokenResponse, RefreshTokenRequest, 
    StatusResponse, UserProfile
)
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login", response_model=AuthResponse)
async def login(
    login_request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access and refresh tokens.
    """
    user = AuthService.authenticate_user(
        db, login_request.username, login_request.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create tokens
    access_token = AuthService.create_access_token(data={"sub": user.id})
    refresh_token = AuthService.create_refresh_token(data={"sub": user.id})
    
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=AuthService.user_to_profile(user)
    )


@router.post("/logout", response_model=StatusResponse)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout user (client should remove tokens).
    """
    return StatusResponse(
        message="Successfully logged out",
        status="success"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = AuthService.verify_token(refresh_request.refresh_token, "refresh")
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = AuthService.get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception

    # Create new access token
    access_token = AuthService.create_access_token(data={"sub": user.id})
    
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    """
    return AuthService.user_to_profile(current_user)