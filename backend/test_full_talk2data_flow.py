#!/usr/bin/env python3
"""
Test the complete Talk2Data flow
"""

import requests
import json

def test_complete_flow():
    """Test the complete Talk2Data flow"""
    
    base_url = "http://localhost:8000/api/talk2data"
    
    print("=== Testing Complete Talk2Data Flow ===\n")
    
    # Step 1: Get available documents
    print("Step 1: Getting available documents...")
    try:
        response = requests.get(f"{base_url}/documents")
        if response.status_code == 200:
            documents = response.json()
            print(f"✅ Found {len(documents)} documents")
            for doc in documents[:3]:  # Show first 3
                print(f"  - {doc['fileName']} ({doc['classification']})")
            if len(documents) > 3:
                print(f"  ... and {len(documents) - 3} more")
        else:
            print(f"❌ Failed to get documents: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error getting documents: {e}")
        return
    
    # Step 2: Test chat with no documents selected
    print(f"\nStep 2: Testing chat with no documents selected...")
    try:
        payload = {
            "message": "What is the model accuracy?",
            "selected_documents": []
        }
        response = requests.post(f"{base_url}/chat", json=payload)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat successful (no docs selected)")
            print(f"  Response: {result['response'][:100]}...")
            print(f"  Sources: {len(result['sources'])}")
        else:
            print(f"❌ Chat failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error in chat: {e}")
    
    # Step 3: Test chat with documents selected
    print(f"\nStep 3: Testing chat with documents selected...")
    try:
        selected_docs = [doc['id'] for doc in documents[:2]]  # Select first 2 docs
        payload = {
            "message": "Can you summarize the key findings from these documents?",
            "selected_documents": selected_docs
        }
        response = requests.post(f"{base_url}/chat", json=payload)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat successful (with {len(selected_docs)} docs selected)")
            print(f"  Response: {result['response'][:150]}...")
            print(f"  Sources: {len(result['sources'])}")
            print(f"  Conversation ID: {result['conversation_id']}")
        else:
            print(f"❌ Chat failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error in chat: {e}")
    
    # Step 4: Test edge cases
    print(f"\nStep 4: Testing edge cases...")
    
    edge_cases = [
        {"message": "", "description": "Empty message"},
        {"message": "   ", "description": "Whitespace only"},
        {"message": "What is the model accuracy?" * 100, "description": "Very long message"},
    ]
    
    for case in edge_cases:
        try:
            payload = {
                "message": case["message"],
                "selected_documents": []
            }
            response = requests.post(f"{base_url}/chat", json=payload, timeout=30)
            
            if case["description"] in ["Empty message", "Whitespace only"]:
                expected_status = 400
            else:
                expected_status = 200
            
            if response.status_code == expected_status:
                print(f"  ✅ {case['description']}: {response.status_code}")
            else:
                print(f"  ❌ {case['description']}: {response.status_code} (expected {expected_status})")
                
        except Exception as e:
            print(f"  ❌ {case['description']}: Error - {e}")
    
    print(f"\n=== Talk2Data Flow Test Complete ===")

if __name__ == "__main__":
    test_complete_flow()