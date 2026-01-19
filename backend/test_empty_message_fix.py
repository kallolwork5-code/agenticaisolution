#!/usr/bin/env python3
"""
Test the empty message fix
"""

import requests
import json

def test_empty_message_scenarios():
    """Test various empty message scenarios"""
    
    url = "http://localhost:9000/api/talk2data/chat"
    
    test_cases = [
        {"message": "", "expected_status": 400, "description": "Empty string"},
        {"message": "   ", "expected_status": 400, "description": "Whitespace only"},
        {"message": "\n\t  \n", "expected_status": 400, "description": "Whitespace and newlines"},
        {"message": "What is the model accuracy?", "expected_status": 200, "description": "Valid message"},
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            print(f"\nTest {i+1}: {test_case['description']}")
            print(f"Message: '{test_case['message']}'")
            
            payload = {
                "message": test_case["message"],
                "selected_documents": []
            }
            
            response = requests.post(url, json=payload, timeout=10)
            
            print(f"Status Code: {response.status_code} (expected: {test_case['expected_status']})")
            
            if response.status_code == test_case['expected_status']:
                print("✅ PASS")
                if response.status_code == 200:
                    result = response.json()
                    print(f"Response: {result['response'][:100]}...")
            else:
                print("❌ FAIL")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_empty_message_scenarios()