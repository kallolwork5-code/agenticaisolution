#!/usr/bin/env python3
"""
Test script to simulate the exact data transformation that the frontend should perform
"""

import requests
import json
from datetime import datetime

def simulate_frontend_data_processing():
    """Simulate exactly what the frontend loadUploadHistory function should do"""
    print("🔄 Simulating Frontend Data Processing")
    print("=" * 50)
    
    try:
        # Step 1: Fetch data from API (same as frontend)
        response = requests.get('http://localhost:8000/api/upload/history')
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            return False
            
        history = response.json()
        print(f"✅ Fetched {len(history)} records from API")
        
        if not history:
            print("⚠️  No data to process")
            return True
        
        # Step 2: Process data exactly like frontend should
        processed_history = []
        
        for item in history:
            print(f"\n📋 Processing item: {item['fileName']}")
            
            # Parse insights (same logic as frontend)
            insights = None
            if item.get('aiInsights') and isinstance(item['aiInsights'], list) and item['aiInsights']:
                first_insight = item['aiInsights'][0]
                if first_insight.get('description') and '```json' in first_insight['description']:
                    try:
                        desc = first_insight['description']
                        json_start = desc.find('[')
                        json_end = desc.rfind(']') + 1
                        if json_start != -1 and json_end != -1:
                            json_str = desc[json_start:json_end]
                            insights = json.loads(json_str)
                            print(f"  ✅ Parsed {len(insights)} insights")
                        else:
                            print(f"  ❌ Could not find JSON boundaries")
                    except Exception as e:
                        print(f"  ❌ Failed to parse insights: {e}")
                else:
                    print(f"  ⚠️  No JSON in description")
            else:
                print(f"  ⚠️  No aiInsights to parse")
            
            # Create processed item (same as frontend)
            processed_item = {
                **item,
                'uploadDate': datetime.fromisoformat(item['uploadDate'].replace('Z', '+00:00')),
                'insights': insights
            }
            
            processed_history.append(processed_item)
            print(f"  ✅ Processed successfully")
        
        # Step 3: Verify the processed data matches frontend expectations
        print(f"\n📊 Final Processed Data Summary:")
        for item in processed_history:
            print(f"  📁 {item['fileName']}:")
            print(f"    - Date: {item['uploadDate']} ({type(item['uploadDate'])})")
            print(f"    - Classification: {item['classification']}")
            print(f"    - Insights: {len(item['insights']) if item['insights'] else 0} items")
            print(f"    - Status: {item['status']}")
            
            # Show sample insight if available
            if item['insights']:
                sample_insight = item['insights'][0]
                print(f"    - Sample insight: {sample_insight['title']} ({sample_insight['type']})")
        
        print(f"\n✅ Frontend data processing simulation completed successfully!")
        print(f"📋 The frontend should now display {len(processed_history)} upload history items")
        
        return True
        
    except Exception as e:
        print(f"❌ Simulation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    simulate_frontend_data_processing()