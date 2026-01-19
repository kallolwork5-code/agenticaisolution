#!/usr/bin/env python3
"""
Check database contents
"""

import sqlite3
import json

def check_database():
    """Check what's in the database"""
    
    print("🔍 Checking collectisense.db")
    print("=" * 40)
    
    try:
        conn = sqlite3.connect('collectisense.db')
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables found: {[t[0] for t in tables]}")
        
        # Check uploads table
        if ('uploads',) in tables:
            cursor.execute('SELECT COUNT(*) FROM uploads')
            count = cursor.fetchone()[0]
            print(f"\nUploads table: {count} records")
            
            if count > 0:
                cursor.execute('SELECT file_name, classification, method, upload_date FROM uploads ORDER BY upload_date DESC LIMIT 10')
                records = cursor.fetchall()
                print("\nRecent uploads:")
                for i, record in enumerate(records, 1):
                    print(f"  {i}. {record[0]} | {record[1]} | {record[2]} | {record[3]}")
        else:
            print("\nNo uploads table found")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

def check_api_response():
    """Check what the API returns"""
    
    print("\n🌐 Checking API Response")
    print("=" * 40)
    
    try:
        import requests
        response = requests.get('http://localhost:9000/api/upload/history')
        print(f"API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"API Records: {len(data)}")
            
            if data:
                print("\nAPI Response (first 3 records):")
                for i, record in enumerate(data[:3], 1):
                    print(f"  {i}. {record['fileName']} | {record['classification']} | {record.get('method', 'NO_METHOD')}")
        else:
            print(f"API Error: {response.text}")
            
    except Exception as e:
        print(f"API Error: {e}")

if __name__ == "__main__":
    check_database()
    check_api_response()