#!/usr/bin/env python3
"""
Debug the upload API to see what's happening
"""

import asyncio
from app.api.upload import get_upload_history
from app.db.models import Upload
from app.db.database import SessionLocal

async def debug_upload_api():
    """Debug the upload API"""
    
    print("🔍 Debugging Upload API")
    print("=" * 40)
    
    # 1. Check direct database query
    print("1. Direct database query:")
    db = SessionLocal()
    try:
        uploads = db.query(Upload).all()
        print(f"   Database records: {len(uploads)}")
        for upload in uploads:
            print(f"   - {upload.file_name} | {upload.method} | {upload.classification}")
    finally:
        db.close()
    
    # 2. Check API function directly
    print("\n2. API function call:")
    try:
        history = await get_upload_history()
        print(f"   API returns: {len(history)} records")
        if history:
            print(f"   First record: {history[0].get('fileName', 'NO_NAME')} | {history[0].get('method', 'NO_METHOD')}")
            print(f"   Record keys: {list(history[0].keys())}")
    except Exception as e:
        print(f"   API error: {e}")
        import traceback
        traceback.print_exc()
    
    # 3. Check model import
    print("\n3. Model verification:")
    print(f"   Upload.__tablename__: {Upload.__tablename__}")
    print(f"   Upload columns: {[c.name for c in Upload.__table__.columns]}")

if __name__ == "__main__":
    asyncio.run(debug_upload_api())