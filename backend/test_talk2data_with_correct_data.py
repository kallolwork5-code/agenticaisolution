#!/usr/bin/env python3
"""
Test Talk2Data with the correct test data that was just added
"""

import requests
import json

def test_talk2data_with_existing_data():
    """Test Talk2Data API with existing ChromaDB data"""
    
    BASE_URL = "http://localhost:9000/api/talk2data"
    
    # Test getting documents
    print("1. Testing GET /documents...")
    response = requests.get(f"{BASE_URL}/documents")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        documents = response.json()
        print(f"Found {len(documents)} documents:")
        for doc in documents:
            print(f"  - {doc['fileName']} ({doc['classification']}) - ID: {doc['id']}")
        
        # Use any available document for testing
        if documents:
            test_doc = documents[0]  # Use first available document
            print(f"\n2. Testing chat with document: {test_doc['fileName']}")
            
            # Test queries that should work with any document content
            test_queries = [
                "What is this document about?",
                "Can you summarize the content?",
                "What are the main topics discussed?",
                "Tell me about the key information in this document"
            ]
            
            for query in test_queries:
                print(f"\nQuery: {query}")
                
                chat_request = {
                    "message": query,
                    "selected_documents": [test_doc['id']]
                }
                
                response = requests.post(
                    f"{BASE_URL}/chat",
                    json=chat_request,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"Response: {result['response'][:300]}...")
                    print(f"Sources found: {len(result.get('sources', []))}")
                    if result.get('sources'):
                        first_source = result['sources'][0]
                        if isinstance(first_source, dict) and 'content' in first_source:
                            print(f"First source preview: {first_source['content'][:100]}...")
                        else:
                            print(f"First source: {str(first_source)[:100]}...")
                else:
                    print(f"Error: {response.status_code} - {response.text}")
        else:
            print("No documents found in API response")
    else:
        print(f"Error getting documents: {response.text}")

if __name__ == "__main__":
    test_talk2data_with_existing_data()