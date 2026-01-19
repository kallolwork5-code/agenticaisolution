#!/usr/bin/env python3
"""
Test ChromaDB directly without async wrapper
"""

from app.vectorstore.chroma_client import ChromaClient

def test_chroma_direct():
    """Test ChromaDB directly"""
    
    client = ChromaClient()
    
    try:
        # Get the collection
        collection = client.client.get_or_create_collection(
            name="documents",
            embedding_function=client.embedding_function
        )
        
        # Check collection count
        count = collection.count()
        print(f"Documents collection has {count} items")
        
        if count > 0:
            # Try a simple query directly
            try:
                results = collection.query(
                    query_texts=["What is the model accuracy?"],
                    n_results=3
                )
                print(f"Direct query successful!")
                print(f"Found {len(results.get('documents', [[]])[0])} results")
                
                if results.get('documents') and results['documents'][0]:
                    first_doc = results['documents'][0][0]
                    print(f"First result: {first_doc[:200]}...")
                    
            except Exception as e:
                print(f"Direct query failed: {e}")
        else:
            print("No documents in collection")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chroma_direct()