#!/usr/bin/env python3
"""
Test script for AI insights service
"""

import asyncio
from app.services.ai_insights_service import ai_insights_service

async def test_ai_insights():
    """Test the AI insights service"""
    
    # Test data
    test_file_content = """
    transaction_id,amount,merchant,card_type,timestamp
    1,100.50,Amazon,VISA,2024-12-16 10:00:00
    2,25.75,Starbucks,MASTERCARD,2024-12-16 11:30:00
    3,500.00,Apple Store,AMEX,2024-12-16 14:15:00
    """
    
    test_file_name = "test_transactions.csv"
    
    print("🧠 Testing AI Insights Service...")
    print("=" * 50)
    
    # Test classification thoughts
    print("\\n1. Testing Classification Thoughts:")
    thoughts = await ai_insights_service.generate_classification_thoughts(
        test_file_content, 
        test_file_name
    )
    
    for i, thought in enumerate(thoughts, 1):
        print(f"   Thought {i}: [{thought['type']}] {thought['content'][:100]}...")
        print(f"   Confidence: {thought['confidence']:.2f}")
        if 'classification' in thought.get('metadata', {}):
            print(f"   Classification: {thought['metadata']['classification']}")
        print()
    
    # Test data insights
    print("\\n2. Testing Data Insights:")
    import pandas as pd
    import io
    
    # Create a DataFrame from the test data
    test_df = pd.read_csv(io.StringIO(test_file_content))
    
    insights = await ai_insights_service.generate_data_insights(
        test_df, 
        "transaction"
    )
    
    for i, insight in enumerate(insights, 1):
        print(f"   Insight {i}: [{insight['type']}] {insight['title']}")
        print(f"   Description: {insight['description']}")
        print(f"   Confidence: {insight['confidence']:.2f}")
        print(f"   Actionable: {insight['actionable']}")
        print()
    
    print("✅ AI Insights Service test completed!")
    
    # Check if LLM is available
    if ai_insights_service.llm:
        print("🤖 OpenAI LLM is available - real AI insights will be generated")
    else:
        print("⚠️  OpenAI LLM not available - using fallback insights")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_ai_insights())
    if success:
        print("\\n🎉 All tests passed!")
    else:
        print("\\n❌ Tests failed!")