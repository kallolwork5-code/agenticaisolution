#!/usr/bin/env python3
"""
Script to create database tables
"""
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.db.database import engine
from app.db import models
from app.models.user import User
from app.models.file_upload import UploadedFile, DataSchema, ProcessedDocument, UploadHistory

def create_tables():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        
        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"📋 Created tables: {', '.join(tables)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_tables()
    if success:
        print("\n🎉 Database setup completed!")
    else:
        print("\n💥 Database setup failed!")
        sys.exit(1)