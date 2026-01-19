#!/usr/bin/env python3
"""
Test script for Talk2Data API
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/talk2data"

def test_get_documents():
    """Test getting available documents"""
    print("Testing GET /documents...")
    response = requests.get(f"{BASE_URL}/documents")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        documents = response.json()
        print(f"Found {len(documents)} documents:")
        for doc in documents:
            print(f"  - {doc['fileName']} ({doc['classification']})")
        return documents
    else:
        print(f"Error: {response.text}")
        return []

def test_chat(documents):
    """Test chat functionality"""
    if not documents:
        print("No documents available for chat test")
        return
    
    print("\nTesting POST /chat...")
    
    # Use the first document for testing
    doc_id = documents[0]['id']
    
    chat_request = {
        "message": "What is this document about?",
        "selected_documents": [doc_id]
    }
    
    response = requests.post(
        f"{BASE_URL}/chat",
        json=chat_request,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {result['response'][:200]}...")
        print(f"Sources: {len(result.get('sources', []))} found")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("Testing Talk2Data API...")
    documents = test_get_documents()
    test_chat(documents)
    print("\nTest completed!")