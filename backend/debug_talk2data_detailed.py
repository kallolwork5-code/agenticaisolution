#!/usr/bin/env python3
"""
Detailed debugging of Talk2Data service
"""

import asyncio
from app.api.talk2data import Talk2DataService
from app.vectorstore.chroma_client import ChromaClient

async def debug_detailed():
    """Detailed debugging"""
    
    print("1. Testing ChromaClient directly...")
    client = ChromaClient()
    
    try:
        results = await client.query_documents(
            query="What is this document about?",
            collection_name="documents",
            n_results=3
        )
        print(f"ChromaClient results: {results}")
        print(f"Documents found: {len(results.get('documents', [[]])[0])}")
        
    except Exception as e:
        print(f"ChromaClient error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n2. Testing Talk2DataService...")
    service = Talk2DataService()
    
    # Test the ChromaClient within the service
    print("Testing service.chroma_client...")
    try:
        service_results = await service.chroma_client.query_documents(
            query="What is this document about?",
            collection_name="documents",
            n_results=3
        )
        print(f"Service ChromaClient results: {service_results}")
        print(f"Service documents found: {len(service_results.get('documents', [[]])[0])}")
        
    except Exception as e:
        print(f"Service ChromaClient error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n3. Testing full service method...")
    try:
        full_result = await service.query_documents(
            query="What is this document about?",
            document_ids=["test_upload_validation"]
        )
        print(f"Full service result: {full_result}")
        
    except Exception as e:
        print(f"Full service error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_detailed())