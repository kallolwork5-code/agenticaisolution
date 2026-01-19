#!/usr/bin/env python3
"""
Test script for the file upload API
"""

import requests
import json
from pathlib import Path

def test_upload_api():
    """Test the file upload API endpoint"""
    
    # API endpoint
    url = "http://localhost:8000/api/files/upload"
    
    # Create a simple test CSV file
    test_data = """transaction_id,amount,currency,merchant_id,timestamp
TXN001,100.50,USD,MERCH001,2024-01-15T10:30:00Z
TXN002,250.75,USD,MERCH002,2024-01-15T11:15:00Z
TXN003,75.25,EUR,MERCH001,2024-01-15T12:00:00Z"""
    
    test_file_path = Path("test_transactions.csv")
    test_file_path.write_text(test_data)
    
    try:
        # Prepare the upload
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_transactions.csv', f, 'text/csv')}
            data = {
                'metadata': json.dumps({
                    'description': 'Test transaction data',
                    'source': 'test_script'
                })
            }
            
            # Make the request
            response = requests.post(url, files=files, data=data)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("✅ Upload test passed!")
                
                # Test status endpoint
                file_id = response.json().get('file_id')
                if file_id:
                    status_url = f"http://localhost:8000/api/files/status/{file_id}"
                    status_response = requests.get(status_url)
                    print(f"Status Response: {status_response.json()}")
            else:
                print("❌ Upload test failed!")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
    finally:
        # Clean up test file
        if test_file_path.exists():
            test_file_path.unlink()

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health Check: {response.json()}")
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print("🧪 Testing Flow AI File Upload API")
    print("=" * 50)
    
    # Test health first
    if test_health_endpoint():
        print("✅ Backend is running")
        test_upload_api()
    else:
        print("❌ Backend is not running. Start it with: uvicorn app.main:app --reload")