#!/usr/bin/env python3
"""
Test ChromaDB query method directly
"""

import asyncio
from app.vectorstore.chroma_client import ChromaClient

async def test_query_method():
    """Test the ChromaDB query method directly"""
    
    client = ChromaClient()
    
    try:
        print("Testing ChromaDB query_documents method...")
        
        # Test the query method
        results = await client.query_documents(
            query="What is the model accuracy?",
            collection_name="documents",
            n_results=3
        )
        
        print(f"Query results type: {type(results)}")
        print(f"Query results keys: {results.keys() if isinstance(results, dict) else 'Not a dict'}")
        
        if results and 'documents' in results:
            documents = results['documents']
            print(f"Documents type: {type(documents)}")
            print(f"Documents length: {len(documents)}")
            
            if documents and len(documents) > 0:
                first_doc_list = documents[0]
                print(f"First document list type: {type(first_doc_list)}")
                print(f"First document list length: {len(first_doc_list)}")
                
                if first_doc_list:
                    print(f"First document preview: {first_doc_list[0][:200]}...")
            else:
                print("No documents in results")
        else:
            print("No 'documents' key in results")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_query_method())