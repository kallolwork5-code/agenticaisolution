#!/usr/bin/env python3
"""
Create uploads table for storing file upload history and AI insights
"""

from app.db.database import engine, Base
from app.db.models import Upload
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_upload_table():
    """Create the uploads table"""
    try:
        # Create all tables (this will only create missing ones)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Upload table created successfully")
        
        # Verify table exists
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'uploads' in tables:
            logger.info("✅ Uploads table verified in database")
            
            # Show table structure
            columns = inspector.get_columns('uploads')
            logger.info("📋 Upload table columns:")
            for col in columns:
                logger.info(f"   - {col['name']}: {col['type']}")
        else:
            logger.error("❌ Uploads table not found after creation")
            
    except Exception as e:
        logger.error(f"❌ Error creating upload table: {e}")
        raise

if __name__ == "__main__":
    create_upload_table()