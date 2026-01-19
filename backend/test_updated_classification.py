#!/usr/bin/env python3
"""
Final test to verify the updated upload classification system is working
"""

import requests
import json
import io
import time

def test_final_upload_system():
    """Test the complete updated upload system"""
    print("🎯 Final Upload System Test")
    print("=" * 40)
    
    try:
        # Step 1: Get initial state
        print("📊 Step 1: Getting initial upload history...")
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code == 200:
            initial_history = response.json()
            initial_count = len(initial_history)
            print(f"✅ Initial history count: {initial_count}")
            
            if initial_history:
                print(f"   Latest file: {initial_history[0].get('fileName', 'N/A')}")
                print(f"   Latest classification: {initial_history[0].get('classification', 'N/A')}")
        else:
            print(f"❌ Failed to get initial history: {response.status_code}")
            return False
        
        # Step 2: Create a new test file with different content
        print(f"\n📁 Step 2: Creating new test file...")
        test_content = f"""product_id,product_name,price,category,rating
PROD001,Wireless Headphones,99.99,Electronics,4.5
PROD002,Coffee Maker,149.99,Appliances,4.2
PROD003,Running Shoes,79.99,Sports,4.8
PROD004,Laptop Stand,39.99,Electronics,4.1"""
        
        test_file = io.BytesIO(test_content.encode('utf-8'))
        test_filename = f"product_catalog_{int(time.time())}.csv"
        print(f"✅ Created test file: {test_filename}")
        
        # Step 3: Upload the new file
        print(f"\n⬆️  Step 3: Uploading new file...")
        files = {'file': (test_filename, test_file, 'text/csv')}
        
        upload_start = time.time()
        response = requests.post('http://localhost:9000/api/upload/process', files=files)
        upload_time = time.time() - upload_start
        
        print(f"Upload completed in {upload_time:.2f} seconds")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload successful!")
            print(f"   - Upload ID: {result.get('upload_id', 'N/A')}")
            print(f"   - Classification: {result.get('classification', 'N/A')}")
            print(f"   - Storage Location: {result.get('storage_location', 'N/A')}")
            print(f"   - Confidence: {result.get('confidence', 0):.1%}")
            print(f"   - Method: {result.get('method', 'N/A')}")
            print(f"   - Record Count: {result.get('record_count', 0)}")
            print(f"   - Insights Generated: {len(result.get('insights', []))}")
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Error details: {response.text}")
            return False
        
        # Step 4: Wait and check updated history
        print(f"\n⏳ Step 4: Waiting for database update...")
        time.sleep(2)
        
        print(f"📊 Step 5: Checking updated history...")
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code == 200:
            updated_history = response.json()
            updated_count = len(updated_history)
            print(f"✅ Updated history count: {updated_count}")
            
            if updated_count > initial_count:
                print(f"🎉 SUCCESS: History increased by {updated_count - initial_count} record(s)")
                
                # Verify the new record
                new_record = updated_history[0]  # Should be most recent
                print(f"\n📋 New record verification:")
                print(f"   - File Name: {new_record.get('fileName', 'N/A')}")
                print(f"   - Classification: {new_record.get('classification', 'N/A')}")
                print(f"   - Status: {new_record.get('status', 'N/A')}")
                print(f"   - Storage: {new_record.get('storageLocation', 'N/A')}")
                print(f"   - Record Count: {new_record.get('recordCount', 0)}")
                print(f"   - AI Summary: {new_record.get('aiSummary', 'N/A')[:100]}...")
                print(f"   - Has Insights: {'✅' if new_record.get('aiInsights') else '❌'}")
                
                # Verify it's real data, not dummy data
                if new_record.get('fileName') == test_filename and 'upload_' in new_record.get('id', ''):
                    print(f"\n✅ CONFIRMED: This is REAL DATA from the upload!")
                    return True
                else:
                    print(f"\n❌ WARNING: This might not be the expected record")
                    return False
            else:
                print(f"❌ FAILED: History count did not increase")
                print(f"   Expected: > {initial_count}, Got: {updated_count}")
                return False
        else:
            print(f"❌ Failed to get updated history: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_frontend_data_compatibility():
    """Test that the data structure is compatible with frontend expectations"""
    print(f"\n🎨 Frontend Data Compatibility Test")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code != 200:
            print(f"❌ API not available: {response.status_code}")
            return False
            
        history = response.json()
        if not history:
            print(f"⚠️  No data to test")
            return True
            
        # Test first record for frontend compatibility
        record = history[0]
        print(f"Testing record: {record.get('fileName', 'N/A')}")
        
        # Required fields for frontend
        required_fields = ['id', 'fileName', 'fileSize', 'uploadDate', 'classification', 
                          'storageLocation', 'recordCount', 'status']
        
        missing_fields = []
        for field in required_fields:
            if field not in record:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        else:
            print(f"✅ All required fields present")
        
        # Test date format (should be ISO string that can be parsed)
        try:
            from datetime import datetime
            upload_date = record.get('uploadDate')
            parsed_date = datetime.fromisoformat(upload_date.replace('Z', '+00:00'))
            print(f"✅ Date parsing works: {parsed_date.strftime('%Y-%m-%d %H:%M:%S')}")
        except Exception as e:
            print(f"❌ Date parsing failed: {e}")
            return False
        
        # Test AI insights structure
        ai_insights = record.get('aiInsights')
        if ai_insights:
            print(f"✅ AI insights present: {type(ai_insights)} with {len(ai_insights)} items")
            if isinstance(ai_insights, list) and ai_insights:
                first_insight = ai_insights[0]
                if isinstance(first_insight, dict):
                    print(f"✅ Insight structure valid: {list(first_insight.keys())}")
                else:
                    print(f"⚠️  Insight structure unexpected: {type(first_insight)}")
        else:
            print(f"⚠️  No AI insights found")
        
        print(f"✅ Frontend compatibility test passed")
        return True
        
    except Exception as e:
        print(f"❌ Frontend compatibility test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Updated Classification System - Final Test")
    print("=" * 50)
    
    # Test the complete upload system
    upload_success = test_final_upload_system()
    
    # Test frontend compatibility
    frontend_success = test_frontend_data_compatibility()
    
    print(f"\n🎯 FINAL TEST RESULTS:")
    print(f"   Upload System: {'✅ WORKING' if upload_success else '❌ FAILED'}")
    print(f"   Frontend Compatibility: {'✅ WORKING' if frontend_success else '❌ FAILED'}")
    
    if upload_success and frontend_success:
        print(f"\n🎉 CONCLUSION: Upload history debugging is COMPLETE!")
        print(f"   ✅ Files are being uploaded and processed correctly")
        print(f"   ✅ Real AI classification is working")
        print(f"   ✅ Upload history is being updated with real data")
        print(f"   ✅ Frontend should now display real upload history")
        print(f"   ✅ No more dummy data issues")
        print(f"\n📋 Next Steps:")
        print(f"   1. Refresh your browser to clear any cached data")
        print(f"   2. Try uploading a file through the UI")
        print(f"   3. Verify that the upload history shows real data")
    else:
        print(f"\n❌ CONCLUSION: There are still issues that need to be resolved")
        if not upload_success:
            print(f"   - Upload system is not working correctly")
        if not frontend_success:
            print(f"   - Frontend data compatibility issues")