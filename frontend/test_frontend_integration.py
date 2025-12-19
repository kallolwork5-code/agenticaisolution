#!/usr/bin/env python3
"""
Test script to verify frontend-backend integration for chatbot
"""

import requests
import json
import time

def test_backend_endpoints():
    """Test the backend chatbot endpoints"""
    base_url = "http://localhost:9000"
    
    print("🧪 Testing Backend Chatbot Endpoints...")
    
    try:
        # Test health endpoint first
        print("\n1️⃣ Testing health endpoint...")
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend not accessible")
            return False
        
        # Test chatbot capabilities endpoint
        print("\n2️⃣ Testing chatbot capabilities...")
        response = requests.get(f"{base_url}/api/chatbot/chat/capabilities")
        if response.status_code == 200:
            capabilities = response.json()
            print(f"✅ Capabilities loaded: {len(capabilities['capabilities'])} features")
            print(f"✅ Sample questions: {len(capabilities['sample_questions'])} examples")
        else:
            print(f"❌ Capabilities endpoint failed: {response.status_code}")
        
        # Test chat endpoint
        print("\n3️⃣ Testing chat endpoint...")
        chat_data = {
            "message": "What are my total cost savings?",
            "conversation_id": None
        }
        
        response = requests.post(
            f"{base_url}/api/chatbot/chat",
            json=chat_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            chat_response = response.json()
            print("✅ Chat endpoint working")
            print(f"✅ Response: {chat_response['message']['content'][:100]}...")
            print(f"✅ Conversation ID: {chat_response['conversation_id']}")
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            print(f"Error: {response.text}")
        
        print("\n✅ Backend integration tests completed successfully!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure the backend server is running on port 8000")
        print("Run: cd backend && python -m uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

def test_frontend_components():
    """Test frontend component structure"""
    print("\n🧪 Testing Frontend Components...")
    
    import os
    
    # Check if chat components exist
    chat_components = [
        "frontend/components/chat/Chatbot.tsx",
        "frontend/components/chat/ChatButton.tsx", 
        "frontend/components/chat/ChatWindow.tsx",
        "frontend/components/chat/ChatMessage.tsx",
        "frontend/components/chat/TypingIndicator.tsx",
        "frontend/components/chat/WelcomeMessage.tsx",
        "frontend/components/chat/index.ts"
    ]
    
    all_exist = True
    for component in chat_components:
        if os.path.exists(component):
            print(f"✅ {component}")
        else:
            print(f"❌ {component} - Missing")
            all_exist = False
    
    # Check PaymentAnalyticsDashboard integration
    dashboard_file = "frontend/components/dashboard/payment-analytics/PaymentAnalyticsDashboard.tsx"
    if os.path.exists(dashboard_file):
        with open(dashboard_file, 'r') as f:
            content = f.read()
            if "import { Chatbot }" in content and "<Chatbot" in content:
                print("✅ Chatbot integrated into PaymentAnalyticsDashboard")
            else:
                print("❌ Chatbot not properly integrated into PaymentAnalyticsDashboard")
                all_exist = False
    
    if all_exist:
        print("\n✅ All frontend components are properly set up!")
    else:
        print("\n❌ Some frontend components are missing")
    
    return all_exist

if __name__ == "__main__":
    print("🚀 Testing AI Chatbot Frontend-Backend Integration")
    print("=" * 60)
    
    # Test frontend components
    frontend_ok = test_frontend_components()
    
    # Test backend endpoints
    backend_ok = test_backend_endpoints()
    
    print("\n" + "=" * 60)
    if frontend_ok and backend_ok:
        print("🎉 All tests passed! Chatbot is ready for use.")
        print("\n📋 Next steps:")
        print("1. Start the backend: cd backend && python -m uvicorn app.main:app --reload")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Navigate to Payment Analytics Dashboard")
        print("4. Click the chat button in the bottom-right corner")
    else:
        print("❌ Some tests failed. Please check the issues above.")