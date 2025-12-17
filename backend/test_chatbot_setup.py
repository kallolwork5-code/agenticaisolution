#!/usr/bin/env python3
"""
Test script to verify chatbot backend setup
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.chatbot_service import ChatbotService
from app.services.payment_data_context import PaymentDataContextManager
import asyncio

async def test_chatbot_setup():
    """Test the chatbot service setup"""
    print("🧪 Testing Chatbot Backend Setup...")
    
    try:
        # Test PaymentDataContextManager
        print("\n1️⃣ Testing Payment Data Context Manager...")
        context_manager = PaymentDataContextManager()
        context_data = context_manager.get_all_context()
        
        print(f"✅ Loaded {len(context_data['transactions'])} transactions")
        print(f"✅ Loaded {len(context_data['rate_cards'])} rate cards")
        print(f"✅ Generated {len(context_data['rate_reconciliation_errors'])} rate reconciliation errors")
        print(f"✅ Generated {len(context_data['sla_delay_errors'])} SLA delay errors")
        print(f"✅ Generated {len(context_data['routing_errors'])} routing errors")
        
        kpis = context_data['kpis']
        print(f"✅ KPIs: Volume=₹{kpis['total_volume']:,}, Savings=₹{kpis['total_savings']:,}")
        
        # Test ChatbotService
        print("\n2️⃣ Testing Chatbot Service...")
        chatbot_service = ChatbotService()
        
        # Test demo response
        test_questions = [
            "What are my total cost savings?",
            "Show me SLA breaches",
            "Analyze transaction TXN0002"
        ]
        
        for question in test_questions:
            print(f"\n❓ Question: {question}")
            response = await chatbot_service.process_message(question)
            print(f"🤖 Response: {response['message']['content'][:100]}...")
        
        print("\n✅ Chatbot backend setup completed successfully!")
        print("\n🚀 Ready to integrate with frontend!")
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_chatbot_setup())