"""
User model for authentication and user management.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    
    # Status and permissions
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Profile information
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    
    # Activity tracking
    last_login = Column(DateTime, nullable=True)
    login_count = Column(String, default="0", nullable=False)  # Using String to avoid integer overflow
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    
    # Additional metadata
    notes = Column(Text, nullable=True)  # Admin notes about the user
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, active={self.is_active})>"
    
    @property
    def full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return self.username
    
    def update_login_info(self):
        """Update login information"""
        self.last_login = datetime.utcnow()
        try:
            current_count = int(self.login_count)
            self.login_count = str(current_count + 1)
        except (ValueError, TypeError):
            self.login_count = "1"