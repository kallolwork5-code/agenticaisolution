#!/usr/bin/env python3
"""
Test script to verify the data flow from backend API to frontend
"""

import requests
import json
from datetime import datetime

def test_upload_history_api():
    """Test the upload history API and verify data structure"""
    print("🧪 Testing Upload History API Data Flow")
    print("=" * 50)
    
    try:
        # Test API endpoint
        response = requests.get('http://localhost:8000/api/upload/history')
        print(f"✅ API Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.text}")
            return False
            
        data = response.json()
        print(f"✅ Records Found: {len(data)}")
        
        if not data:
            print("⚠️  No data to test - database is empty")
            return True
            
        # Test first record structure
        record = data[0]
        print(f"\n📋 Testing Record Structure:")
        
        # Required fields for frontend
        required_fields = {
            'id': str,
            'fileName': str, 
            'fileSize': int,
            'uploadDate': str,  # Should be ISO string from API
            'classification': str,
            'storageLocation': str,
            'recordCount': int,
            'status': str
        }
        
        for field, expected_type in required_fields.items():
            if field in record:
                actual_type = type(record[field])
                if actual_type == expected_type:
                    print(f"  ✅ {field}: {actual_type.__name__} = {record[field]}")
                else:
                    print(f"  ❌ {field}: Expected {expected_type.__name__}, got {actual_type.__name__}")
            else:
                print(f"  ❌ Missing required field: {field}")
        
        # Test optional fields
        optional_fields = ['aiSummary', 'aiInsights', 'confidence', 'method', 'reasoning']
        print(f"\n📋 Optional Fields:")
        for field in optional_fields:
            if field in record:
                print(f"  ✅ {field}: Present ({type(record[field]).__name__})")
            else:
                print(f"  ⚠️  {field}: Not present")
        
        # Test date parsing (what frontend needs to do)
        print(f"\n📅 Date Parsing Test:")
        upload_date_str = record.get('uploadDate')
        if upload_date_str:
            try:
                # This is what the frontend should do
                parsed_date = datetime.fromisoformat(upload_date_str.replace('Z', '+00:00'))
                print(f"  ✅ Date parsing successful: {parsed_date}")
            except Exception as e:
                print(f"  ❌ Date parsing failed: {e}")
        
        # Test aiInsights parsing (what frontend needs to do)
        print(f"\n🧠 AI Insights Parsing Test:")
        ai_insights = record.get('aiInsights')
        if ai_insights:
            print(f"  📊 aiInsights type: {type(ai_insights)}")
            if isinstance(ai_insights, list) and ai_insights:
                first_insight = ai_insights[0]
                print(f"  📊 First insight type: {type(first_insight)}")
                
                if isinstance(first_insight, dict) and 'description' in first_insight:
                    desc = first_insight['description']
                    if '```json' in desc:
                        try:
                            # Extract JSON from markdown
                            json_start = desc.find('[')
                            json_end = desc.rfind(']') + 1
                            if json_start != -1 and json_end != -1:
                                json_str = desc[json_start:json_end]
                                parsed_insights = json.loads(json_str)
                                print(f"  ✅ Successfully parsed {len(parsed_insights)} insights")
                                print(f"  📋 Sample insight: {parsed_insights[0]['title']}")
                            else:
                                print(f"  ❌ Could not find JSON boundaries in description")
                        except Exception as e:
                            print(f"  ❌ JSON parsing failed: {e}")
                    else:
                        print(f"  ⚠️  Description doesn't contain JSON markdown")
                else:
                    print(f"  ⚠️  First insight missing description field")
            else:
                print(f"  ⚠️  aiInsights is not a list or is empty")
        else:
            print(f"  ⚠️  No aiInsights field found")
        
        print(f"\n✅ Data flow test completed successfully!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Please start the backend server with: python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_upload_history_api()