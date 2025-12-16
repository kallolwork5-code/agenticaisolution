#!/usr/bin/env python3
"""
Check all upload-related tables
"""

import sqlite3

def check_all_tables():
    """Check all upload-related tables"""
    
    print("🔍 Checking all upload-related tables")
    print("=" * 50)
    
    conn = sqlite3.connect('collectisense.db')
    cursor = conn.cursor()
    
    # Tables to check
    tables_to_check = ['uploads', 'uploaded_files', 'upload_history']
    
    for table_name in tables_to_check:
        print(f"\n📋 Table: {table_name}")
        print("-" * 30)
        
        try:
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            if not cursor.fetchone():
                print(f"   ❌ Table {table_name} does not exist")
                continue
            
            # Get count
            cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
            count = cursor.fetchone()[0]
            print(f"   📊 Records: {count}")
            
            if count > 0:
                # Get column names
                cursor.execute(f'PRAGMA table_info({table_name})')
                columns = [col[1] for col in cursor.fetchall()]
                print(f"   📝 Columns: {columns}")
                
                # Get sample data
                cursor.execute(f'SELECT * FROM {table_name} LIMIT 3')
                records = cursor.fetchall()
                print(f"   📄 Sample data:")
                for i, record in enumerate(records, 1):
                    print(f"      {i}. {record}")
        
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    conn.close()

if __name__ == "__main__":
    check_all_tables()