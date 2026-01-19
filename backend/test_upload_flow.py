#!/usr/bin/env python3
"""
Test script to verify the complete upload flow
"""

import requests
import json
import io
import time

def test_upload_flow():
    """Test the complete upload flow from file upload to history"""
    print("🚀 Testing Complete Upload Flow")
    print("=" * 50)
    
    try:
        # Step 1: Check current upload history count
        print("📊 Step 1: Checking current upload history...")
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code == 200:
            initial_history = response.json()
            initial_count = len(initial_history)
            print(f"✅ Current history count: {initial_count}")
        else:
            print(f"❌ Failed to get initial history: {response.status_code}")
            return False
        
        # Step 2: Create a test CSV file
        print("\n📁 Step 2: Creating test CSV file...")
        test_csv_content = """customer_id,transaction_amount,merchant_name,card_type
CUST001,45.99,Starbucks,VISA
CUST002,125.50,Amazon,MASTERCARD
CUST003,89.75,Best Buy,AMEX"""
        
        test_file = io.BytesIO(test_csv_content.encode('utf-8'))
        test_filename = f"test_upload_{int(time.time())}.csv"
        print(f"✅ Created test file: {test_filename}")
        
        # Step 3: Upload the file
        print(f"\n⬆️  Step 3: Uploading file to /api/upload/process...")
        files = {'file': (test_filename, test_file, 'text/csv')}
        
        response = requests.post('http://localhost:9000/api/upload/process', files=files)
        print(f"Upload response status: {response.status_code}")
        
        if response.status_code == 200:
            upload_result = response.json()
            print(f"✅ Upload successful!")
            print(f"   - Upload ID: {upload_result.get('upload_id', 'N/A')}")
            print(f"   - Classification: {upload_result.get('classification', 'N/A')}")
            print(f"   - Storage: {upload_result.get('storage_location', 'N/A')}")
            print(f"   - Confidence: {upload_result.get('confidence', 0):.1%}")
            print(f"   - Insights: {len(upload_result.get('insights', []))} items")
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
        
        # Step 4: Wait a moment for database to update
        print(f"\n⏳ Step 4: Waiting for database update...")
        time.sleep(2)
        
        # Step 5: Check if upload history increased
        print(f"\n📊 Step 5: Checking updated upload history...")
        response = requests.get('http://localhost:9000/api/upload/history')
        if response.status_code == 200:
            updated_history = response.json()
            updated_count = len(updated_history)
            print(f"✅ Updated history count: {updated_count}")
            
            if updated_count > initial_count:
                print(f"🎉 SUCCESS: History increased by {updated_count - initial_count} record(s)")
                
                # Show the new record
                new_record = updated_history[0]  # Should be the most recent
                print(f"\n📋 New record details:")
                print(f"   - File: {new_record.get('fileName', 'N/A')}")
                print(f"   - Classification: {new_record.get('classification', 'N/A')}")
                print(f"   - Status: {new_record.get('status', 'N/A')}")
                print(f"   - Records: {new_record.get('recordCount', 0)}")
                print(f"   - AI Summary: {new_record.get('aiSummary', 'N/A')[:100]}...")
                
                return True
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

def test_database_connection():
    """Test if the database is accessible"""
    print("\n🗄️  Testing Database Connection")
    print("=" * 30)
    
    try:
        from app.db.database import SessionLocal
        from app.db.models import Upload
        
        db = SessionLocal()
        try:
            # Try to query the uploads table
            count = db.query(Upload).count()
            print(f"✅ Database connection successful")
            print(f"✅ Current upload records in database: {count}")
            return True
        except Exception as e:
            print(f"❌ Database query failed: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Upload Flow Test Suite")
    print("=" * 50)
    
    # Test database connection first
    db_ok = test_database_connection()
    
    if db_ok:
        # Test the complete upload flow
        success = test_upload_flow()
        
        if success:
            print(f"\n🎉 CONCLUSION: Upload flow is working correctly!")
            print(f"   - Files are being uploaded and processed")
            print(f"   - AI analysis is generating insights")
            print(f"   - Records are being stored in database")
            print(f"   - Upload history is being updated")
        else:
            print(f"\n❌ CONCLUSION: Upload flow has issues that need fixing")
    else:
        print(f"\n❌ CONCLUSION: Database connection issues prevent upload testing")