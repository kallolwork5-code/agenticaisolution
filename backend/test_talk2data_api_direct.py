#!/usr/bin/env python3
"""
Direct API test for Talk2Data chat endpoint
"""

import requests
import json

def test_chat_api():
    """Test the chat API directly"""
    
    url = "http://localhost:8000/api/talk2data/chat"
    
    payload = {
        "message": "What is the model accuracy?",
        "selected_documents": ["test_doc"]
    }
    
    try:
        print(f"Testing POST {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Response: {json.dumps(result, indent=2, default=str)}")
        else:
            print(f"Error Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Connection error - is the server running?")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat_api()