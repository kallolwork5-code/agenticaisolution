#!/usr/bin/env python3
"""
Test CORS and browser-like requests
"""

import requests
import json

def test_cors_preflight():
    """Test CORS preflight request"""
    
    url = "http://localhost:9000/api/talk2data/chat"
    
    # OPTIONS request (preflight)
    try:
        print("Testing CORS preflight (OPTIONS request)")
        response = requests.options(
            url,
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
    except Exception as e:
        print(f"CORS Error: {e}")

def test_browser_like_request():
    """Test browser-like request with all headers"""
    
    url = "http://localhost:9000/api/talk2data/chat"
    
    payload = {
        "message": "What is the model accuracy?",
        "selected_documents": []
    }
    
    try:
        print(f"\nTesting browser-like POST request")
        response = requests.post(
            url,
            json=payload,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'http://localhost:3000',
                'Referer': 'http://localhost:3000/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Response: {result['response'][:100]}...")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

def test_malformed_request():
    """Test potentially malformed request that might cause 500"""
    
    url = "http://localhost:9000/api/talk2data/chat"
    
    # Test with missing fields
    payloads = [
        {},  # Empty payload
        {"message": ""},  # Empty message
        {"message": None},  # Null message
        {"selected_documents": None},  # Null documents
        {"message": "test", "selected_documents": "not_a_list"},  # Wrong type
    ]
    
    for i, payload in enumerate(payloads):
        try:
            print(f"\nTesting malformed request {i+1}: {payload}")
            response = requests.post(url, json=payload, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error Response: {response.text}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_cors_preflight()
    test_browser_like_request()
    test_malformed_request()