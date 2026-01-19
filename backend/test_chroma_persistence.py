#!/usr/bin/env python3
"""
Test ChromaDB persistence
"""

import asyncio
from app.vectorstore.chroma_client import ChromaClient
from langchain_core.documents import Document as LangChainDocument
from datetime import datetime

async def test_persistence():
    """Test ChromaDB persistence"""
    
    print("Creating ChromaClient...")
    client = ChromaClient()
    
    print("Creating test documents...")
    test_documents = [
        LangChainDocument(
            page_content="The model accuracy is 85% with good performance metrics.",
            metadata={
                "filename": "test.txt",
                "document_id": "test_1",
                "chunk_index": 0
            }
        ),
        LangChainDocument(
            page_content="The algorithm uses gradient boosting with multiple features.",
            metadata={
                "filename": "test.txt", 
                "document_id": "test_1",
                "chunk_index": 1
            }
        )
    ]
    
    try:
        print("Adding documents to ChromaDB...")
        await client.add_documents(test_documents, "documents")
        print("Documents added successfully")
        
        # Check immediately
        print("Checking collections immediately...")
        collections = client.client.list_collections()
        print(f"Found {len(collections)} collections after adding")
        
        for collection in collections:
            print(f"Collection: {collection.name}, Count: {collection.count()}")
            
        # Try to query immediately
        print("Querying immediately...")
        results = await client.query_documents(
            query="model accuracy",
            collection_name="documents",
            n_results=2
        )
        
        print(f"Immediate query results: {results}")
        
        # Create a new client instance to test persistence
        print("Creating new client instance...")
        client2 = ChromaClient()
        
        print("Checking collections with new client...")
        collections2 = client2.client.list_collections()
        print(f"Found {len(collections2)} collections with new client")
        
        for collection in collections2:
            print(f"Collection: {collection.name}, Count: {collection.count()}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_persistence())