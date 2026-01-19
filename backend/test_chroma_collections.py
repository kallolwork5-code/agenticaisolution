#!/usr/bin/env python3
"""
Test ChromaDB collections and contents
"""

from app.vectorstore.chroma_client import ChromaClient

def test_collections():
    """Test ChromaDB collections"""
    
    client = ChromaClient()
    
    try:
        # List all collections
        collections = client.client.list_collections()
        print(f"Found {len(collections)} collections:")
        
        for collection in collections:
            print(f"\nCollection: {collection.name}")
            print(f"  Count: {collection.count()}")
            
            if collection.count() > 0:
                # Get a few documents from this collection
                try:
                    results = collection.get(limit=3)
                    print(f"  Sample documents:")
                    for i, doc in enumerate(results.get('documents', [])):
                        print(f"    {i+1}: {doc[:100]}...")
                        
                    # Try a query on this collection
                    query_results = collection.query(
                        query_texts=["model accuracy"],
                        n_results=2
                    )
                    print(f"  Query results: {len(query_results.get('documents', [[]])[0])} found")
                    
                except Exception as e:
                    print(f"  Error querying collection: {e}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_collections()