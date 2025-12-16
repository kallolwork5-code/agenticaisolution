import requests
import json

# Test the schema API
print("=== Testing Schema API ===")
try:
    response = requests.get('http://localhost:8000/api/schemas/list')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        schemas = data.get('schemas', [])
        print(f"Found {len(schemas)} schemas:")
        for schema in schemas:
            print(f"  - {schema['table_name']} ({schema['data_type']}) - {schema['file_count']} files, {schema['actual_row_count']} records")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Testing File List API ===")
try:
    response = requests.get('http://localhost:8000/api/files/list')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        files = data.get('files', [])
        print(f"Found {len(files)} files:")
        for file in files[:5]:  # Show first 5 files
            print(f"  - {file['filename']} ({file['status']}) - {file['records']} records")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Testing Health Check ===")
try:
    response = requests.get('http://localhost:8000/health')
    print(f"Health Status: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Error: {e}")