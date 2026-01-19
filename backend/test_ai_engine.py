#!/usr/bin/env python3
"""
Test script for AI Engine functionality
"""
import os
import sys
import asyncio
import json
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent))

from app.agents.ai_query_agent import AIQueryAgent

async def test_ai_engine():
    """Test the AI Engine with sample queries"""
    
    print("🤖 Testing Flow AI Engine")
    print("=" * 50)
    
    # Check if OpenAI API key is configured
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OpenAI API key not found!")
        print("Please set the OPENAI_API_KEY environment variable")
        print("Example: export OPENAI_API_KEY='your-api-key-here'")
        return False
    
    print(f"✅ OpenAI API key configured (ends with: ...{api_key[-4:]})")
    
    try:
        # Initialize AI Query Agent
        print("\n🔧 Initializing AI Query Agent...")
        ai_agent = AIQueryAgent()
        print("✅ AI Query Agent initialized successfully")
        
        # Test data summary
        print("\n📊 Getting data summary...")
        data_summary = ai_agent.get_available_data_summary()
        print(f"✅ Found {data_summary.get('total_tables', 0)} tables and {data_summary.get('total_documents', 0)} document collections")
        
        if data_summary.get('structured_data', {}).get('tables'):
            print("📋 Available tables:")
            for table in data_summary['structured_data']['tables']:
                if isinstance(table, dict):
                    table_name = table.get('name', table.get('table_name', 'Unknown'))
                    row_count = table.get('row_count', 'Unknown')
                    print(f"   - {table_name}: {row_count} rows")
                else:
                    print(f"   - {table}")
        
        # Test sample queries
        test_queries = [
            "What data do I have available?",
            "How many tables are in my database?",
            "Show me a summary of my data"
        ]
        
        print(f"\n🧪 Testing {len(test_queries)} sample queries...")
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n--- Query {i}: {query} ---")
            
            try:
                result = ai_agent.process_query(query)
                
                if result['status'] == 'success':
                    print("✅ Query processed successfully")
                    print(f"📝 Response: {result['response'][:200]}...")
                    if result.get('data_sources'):
                        print(f"📊 Data sources used: {', '.join(result['data_sources'])}")
                else:
                    print(f"❌ Query failed: {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                print(f"❌ Query error: {str(e)}")
        
        print("\n🎉 AI Engine test completed!")
        return True
        
    except Exception as e:
        print(f"❌ AI Engine initialization failed: {str(e)}")
        return False

def test_sql_execution():
    """Test SQL query execution"""
    print("\n🗄️  Testing SQL execution...")
    
    try:
        ai_agent = AIQueryAgent()
        
        # Test basic SQL queries
        test_sql_queries = [
            "SELECT name FROM sqlite_master WHERE type='table'",
            "SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ]
        
        for sql in test_sql_queries:
            print(f"\n🔍 Executing: {sql}")
            result = ai_agent.execute_sql_query(sql)
            
            if result['status'] == 'success':
                print(f"✅ SQL executed successfully - {result['row_count']} rows returned")
                if result['data']:
                    print(f"📊 Sample result: {result['data'][0] if result['data'] else 'No data'}")
            else:
                print(f"❌ SQL failed: {result.get('error', 'Unknown error')}")
                
    except Exception as e:
        print(f"❌ SQL test failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting AI Engine Tests")
    
    # Run async test
    success = asyncio.run(test_ai_engine())
    
    if success:
        # Run SQL tests
        test_sql_execution()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        print("\n💡 Next steps:")
        print("1. Start the FastAPI server: uvicorn app.main:app --reload")
        print("2. Open the frontend and navigate to AI Engine")
        print("3. Try asking questions about your data!")
    else:
        print("\n❌ Tests failed. Please check the configuration and try again.")