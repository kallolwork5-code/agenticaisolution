#!/usr/bin/env python3
"""
Debug Talk2Data service directly
"""

import asyncio
from app.api.talk2data import Talk2DataService

async def debug_talk2data_service():
    """Debug the Talk2Data service directly"""
    
    service = Talk2DataService()
    
    print("Testing Talk2DataService.query_documents method...")
    
    try:
        result = await service.query_documents(
            query="What is this document about?",
            document_ids=["test_upload_validation"]
        )
        
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_talk2data_service())