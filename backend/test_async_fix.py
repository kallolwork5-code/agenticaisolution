#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append('.')

async def test_ingestion_graph():
    """Test the ingestion graph with async invocation"""
    try:
        from app.agents.ingestion_graph import build_ingestion_graph
        
        # Build the ingestion graph
        ingestion_graph = build_ingestion_graph()
        
        # Test classification state
        classification_state = {
            "file_name": "test.csv",
            "columns": ["acquirer_name", "terminal_id", "transaction_amount"],
            "sample_rows": [
                {"acquirer_name": "Bank A", "terminal_id": "T001", "transaction_amount": 100.50},
                {"acquirer_name": "Bank B", "terminal_id": "T002", "transaction_amount": 250.75}
            ]
        }
        
        print("Testing async ingestion graph...")
        
        # Use async invocation
        classification_result = await ingestion_graph.ainvoke(classification_state)
        
        print("✅ Async ingestion graph test successful!")
        print(f"Classification result: {classification_result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Async ingestion graph test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing async fix for ingestion graph...")
    success = asyncio.run(test_ingestion_graph())
    if success:
        print("\n🎉 Async fix is working!")
    else:
        print("\n💥 Async fix failed!")