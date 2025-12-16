"""
Database initialization script to create default user and setup.
"""

import os
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db import models
from app.models.user import User
from app.services.auth_service import AuthService


def init_database():
    """Initialize database with tables and default data."""
    # Create all tables
    models.Base.metadata.create_all(bind=engine)
    
    # Create default user if not exists
    db = SessionLocal()
    try:
        # Check if any users exist
        existing_user = db.query(User).first()
        if not existing_user:
            # Create default admin user
            default_user = AuthService.create_user(
                db=db,
                username="admin",
                password="admin123",
                email="admin@example.com"
            )
            print(f"Created default user: {default_user.username}")
        else:
            print("Users already exist in database")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()