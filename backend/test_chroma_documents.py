#!/usr/bin/env python3
"""
Test ChromaDB documents collection
"""

from app.vectorstore.chroma_client import ChromaClient
import asyncio

async def test_chroma_documents():
    """Test ChromaDB documents collection"""
    client = ChromaClient()
    
    try:
        # Try to query the documents collection
        print("Testing ChromaDB documents collection...")
        
        # Get the collection
        collection = client.client.get_or_create_collection(
            name="documents",
            embedding_function=client.embedding_function
        )
        
        # Check collection count
        count = collection.count()
        print(f"Documents collection has {count} items")
        
        if count > 0:
            # Try a simple query
            results = collection.query(
                query_texts=["validation"],
                n_results=3
            )
            print(f"Query results: {len(results.get('documents', [[]])[0])} documents found")
            
            # Show first result
            if results.get('documents') and results['documents'][0]:
                first_doc = results['documents'][0][0]
                print(f"First document preview: {first_doc[:200]}...")
        else:
            print("No documents found in collection")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_chroma_documents())