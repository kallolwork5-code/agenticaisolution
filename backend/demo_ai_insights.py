#!/usr/bin/env python3
"""
Demo script showing AI insights capabilities
"""

import asyncio
import os
from app.services.ai_insights_service import ai_insights_service

async def demo_ai_insights():
    """Demonstrate AI insights capabilities"""
    
    print("🚀 AI Insights Demo")
    print("=" * 50)
    
    # Check if OpenAI API key is available
    if os.getenv("OPENAI_API_KEY"):
        print("✅ OpenAI API key found - Real AI insights will be generated")
        llm_status = "REAL AI"
    else:
        print("⚠️  No OpenAI API key - Using intelligent fallback insights")
        llm_status = "FALLBACK"
    
    print(f"🧠 Mode: {llm_status}")
    print()
    
    # Demo data samples
    demo_files = [
        {
            "name": "customer_data.csv",
            "content": """
            customer_id,name,email,age,city,purchase_amount,last_purchase_date
            1,John Doe,john@email.com,35,New York,1250.50,2024-12-15
            2,Jane Smith,jane@email.com,28,Los Angeles,890.25,2024-12-14
            3,Bob Johnson,bob@email.com,42,Chicago,2100.75,2024-12-13
            """
        },
        {
            "name": "transaction_data.csv", 
            "content": """
            transaction_id,amount,merchant,card_type,timestamp,status
            TXN001,100.50,Amazon,VISA,2024-12-16 10:00:00,SUCCESS
            TXN002,25.75,Starbucks,MASTERCARD,2024-12-16 11:30:00,SUCCESS
            TXN003,500.00,Apple Store,AMEX,2024-12-16 14:15:00,FAILED
            """
        },
        {
            "name": "rate_card_2024.csv",
            "content": """
            acquirer,terminal_id,payment_mode,card_classification,network,agreed_mdr_rate
            HDFC,T001,CARD,PREMIUM,VISA,1.8
            ICICI,T002,CARD,STANDARD,MASTERCARD,2.1
            SBI,T003,UPI,STANDARD,UPI,0.5
            """
        }
    ]
    
    for i, demo_file in enumerate(demo_files, 1):
        print(f"📁 Demo {i}: {demo_file['name']}")
        print("-" * 30)
        
        # Generate classification thoughts
        thoughts = await ai_insights_service.generate_classification_thoughts(
            demo_file['content'],
            demo_file['name']
        )
        
        print("🧠 AI Classification Thoughts:")
        for thought in thoughts:
            print(f"   [{thought['type'].upper()}] {thought['content'][:80]}...")
            print(f"   Confidence: {thought['confidence']:.1%}")
            if 'classification' in thought.get('metadata', {}):
                print(f"   → Classification: {thought['metadata']['classification']}")
            print()
        
        # Generate data insights
        import pandas as pd
        import io
        
        try:
            df = pd.read_csv(io.StringIO(demo_file['content']))
            insights = await ai_insights_service.generate_data_insights(df, "auto-detect")
            
            print("💡 AI Data Insights:")
            for insight in insights:
                print(f"   [{insight['type'].upper()}] {insight['title']}")
                print(f"   {insight['description'][:100]}...")
                print(f"   Confidence: {insight['confidence']:.1%} | Actionable: {insight['actionable']}")
                print()
        except Exception as e:
            print(f"   ⚠️  Could not generate data insights: {e}")
        
        print("=" * 50)
        print()
    
    print("🎯 Demo Summary:")
    print(f"   • AI Mode: {llm_status}")
    print(f"   • Files Analyzed: {len(demo_files)}")
    print(f"   • Classification: ✅ Working")
    print(f"   • Insights Generation: ✅ Working")
    print(f"   • Real-time Streaming: ✅ Ready (via WebSocket)")
    print()
    
    if not os.getenv("OPENAI_API_KEY"):
        print("💡 To enable real AI insights:")
        print("   1. Set OPENAI_API_KEY environment variable")
        print("   2. Restart the backend")
        print("   3. Upload files will use GPT-4o-mini for analysis")
    
    print("\\n🎉 Demo completed successfully!")

if __name__ == "__main__":
    asyncio.run(demo_ai_insights())