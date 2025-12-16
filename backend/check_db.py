import sqlite3

# Connect to database
conn = sqlite3.connect('prompts.db')
cursor = conn.cursor()

# Check all tables
print("=== All Tables ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print(table[0])

# Check if file_summaries table exists
print("\n=== File Summaries Table Check ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='file_summaries'")
result = cursor.fetchone()
if result:
    print("file_summaries table exists")
    cursor.execute('PRAGMA table_info(file_summaries)')
    for row in cursor.fetchall():
        print(row)
else:
    print("file_summaries table does not exist")

conn.close()