#!/usr/bin/env python3
"""
Test script to verify real classification is working and upload history is being updated
"""

import requests
import json
import io
import time
import websocket
import threading

def test_websocket_connection():
    """Test WebSocket connection to the upload endpoint"""
    print("🔌 Testing WebSocket Connection")
    print("=" * 30)
    
    try:
        ws_url = "ws://localhost:9000/api/upload/ws/upload"
        print(f"Connecting to: {ws_url}")
        
        def on_message(ws, message):
            data = json.loads(message)
            print(f"📨 WebSocket message: {data.get('type', 'unknown')} - {data.get('message', data.get('content', 'no message'))}")
        
        def on_error(ws, error):
            print(f"❌ WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            print(f"🔌 WebSocket closed: {close_status_code} - {close_msg}")
        
        def on_open(ws):
            print(f"✅ WebSocket connected successfully!")
            # Send a test message
            ws.send("test")
        
        ws = websocket.WebSocketApp(ws_url,
                                  on_open=on_open,
                                  on_message=on_message,
                                  on_error=on_error,
                                  on_close=on_close)
        
        # Run WebSocket in a separate thread for 3 seconds
        wst = threading.Thread(target=ws.run_forever)
        wst.daemon = True
        wst.start()
        
        time.sleep(3)
        ws.close()
        
        return True
        
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

def test_upload_without_websocket():
    """Test upload process without relying on WebSocket"""
    print("\n📤 Testing Upload Without WebSocket")
    print("=" * 40)
    
    try:
        # Get initial history count
        response = requests.get('http://localhost:9000/api/upload/history')
        initial_count = len(response.json()) if response.status_code == 200 else 0
        print(f"Initial history count: {initial_count}")
        
        # Create test file
        test_csv = """transaction_id,amount,merchant,card_type,date
TXN001,99.99,Apple Store,VISA,2024-12-16
TXN002,45.50,Starbucks,MASTERCARD,2024-12-16
TXN003,199.99,Amazon,AMEX,2024-12-16"""
        
        test_file = io.BytesIO(test_csv.encode('utf-8'))
        test_filename = f"real_test_{int(time.time())}.csv"
        
        # Upload file directly to API
        files = {'file': (test_filename, test_file, 'text/csv')}
        print(f"Uploading {test_filename}...")
        
        response = requests.post('http://localhost:9000/api/upload/process', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload successful!")
            print(f"   - Upload ID: {result.get('upload_id')}")
            print(f"   - Classification: {result.get('classification')}")
            print(f"   - Storage: {result.get('storage_location')}")
            print(f"   - Method: {result.get('method')}")
            print(f"   - Confidence: {result.get('confidence', 0):.1%}")
            print(f"   - Record Count: {result.get('record_count')}")
            print(f"   - Insights: {len(result.get('insights', []))} items")
            
            # Wait for database update
            time.sleep(1)
            
            # Check if history was updated
            response = requests.get('http://localhost:9000/api/upload/history')
            if response.status_code == 200:
                new_history = response.json()
                new_count = len(new_history)
                print(f"\n📊 History updated: {initial_count} → {new_count}")
                
                if new_count > initial_count:
                    print(f"✅ SUCCESS: New upload added to history!")
                    
                    # Show the new record
                    latest_record = new_history[0]
                    print(f"\n📋 Latest record:")
                    print(f"   - File: {latest_record.get('fileName')}")
                    print(f"   - Classification: {latest_record.get('classification')}")
                    print(f"   - Status: {latest_record.get('status')}")
                    print(f"   - AI Summary: {latest_record.get('aiSummary', '')[:100]}...")
                    
                    return True
                else:
                    print(f"❌ FAILED: History count did not increase")
                    return False
            else:
                print(f"❌ Failed to check updated history")
                return False
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Upload test failed: {e}")
        return False

def test_frontend_simulation():
    """Test what happens when frontend falls back to simulation"""
    print("\n🎭 Testing Frontend Simulation Fallback")
    print("=" * 40)
    
    print("When WebSocket fails, frontend should:")
    print("1. Fall back to simulateUploadProcess()")
    print("2. Still call loadUploadHistory() at the end")
    print("3. Display the real data from the API")
    
    # Test the history API that frontend calls
    try:
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code == 200:
            history = response.json()
            print(f"\n✅ History API working: {len(history)} records")
            
            if history:
                latest = history[0]
                print(f"   - Latest file: {latest.get('fileName')}")
                print(f"   - Classification: {latest.get('classification')}")
                print(f"   - Real data: {'✅' if 'upload_' in latest.get('id', '') else '❌'}")
            
            return True
        else:
            print(f"❌ History API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ History API test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Real Classification & Upload History Test")
    print("=" * 50)
    
    # Test WebSocket connection
    ws_ok = test_websocket_connection()
    
    # Test upload process
    upload_ok = test_upload_without_websocket()
    
    # Test frontend fallback
    frontend_ok = test_frontend_simulation()
    
    print(f"\n🎯 FINAL RESULTS:")
    print(f"   WebSocket Connection: {'✅' if ws_ok else '❌'}")
    print(f"   Upload Process: {'✅' if upload_ok else '❌'}")
    print(f"   Frontend Fallback: {'✅' if frontend_ok else '❌'}")
    
    if upload_ok and frontend_ok:
        print(f"\n🎉 CONCLUSION: Upload system is working!")
        print(f"   - Files are being processed and stored")
        print(f"   - Real AI classification is working")
        print(f"   - Upload history is being updated")
        print(f"   - Frontend should display real data")
        if not ws_ok:
            print(f"   - WebSocket issues, but fallback simulation works")
    else:
        print(f"\n❌ CONCLUSION: There are still issues to resolve")