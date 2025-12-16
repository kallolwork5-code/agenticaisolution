#!/usr/bin/env python3

import requests
import os

def test_enhanced_upload():
    """Test the enhanced upload API"""
    
    # Create a simple test file
    test_data = """acquirer_name,terminal_id,transaction_amount
Bank A,T001,100.50
Bank B,T002,250.75
Bank C,T003,75.25"""
    
    with open('test_upload.csv', 'w') as f:
        f.write(test_data)
    
    try:
        # Test the endpoint
        with open('test_upload.csv', 'rb') as f:
            files = {'file': ('test_upload.csv', f, 'text/csv')}
            response = requests.post('http://localhost:8000/api/enhanced-upload/upload-no-auth', files=files, timeout=10)
            
        print(f'Status: {response.status_code}')
        
        if response.status_code == 200:
            print('✅ Enhanced upload API is working!')
            result = response.json()
            print(f'File ID: {result.get("file_id")}')
            print(f'Status: {result.get("status")}')
            print(f'Classification: {result.get("classification", {})}')
            print(f'WebSocket URL: {result.get("websocket_url")}')
            return True
        else:
            print(f'❌ Error: {response.text}')
            return False
            
    except requests.exceptions.ConnectionError:
        print('❌ Backend server is not running. Please start it with: uvicorn app.main:app --reload')
        return False
    except Exception as e:
        print(f'❌ Test failed: {e}')
        return False
    finally:
        # Cleanup
        if os.path.exists('test_upload.csv'):
            os.remove('test_upload.csv')

if __name__ == "__main__":
    print("Testing Enhanced Upload API...")
    success = test_enhanced_upload()
    if success:
        print("\n🎉 Enhanced upload is working!")
    else:
        print("\n💥 Enhanced upload test failed!")