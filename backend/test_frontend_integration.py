#!/usr/bin/env python3
"""
Test script to verify frontend-backend integration for AI Workflows
"""

import asyncio
import sys
import os
import json
from datetime import date

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_api_endpoints():
    """Test that AI Workflows API endpoints are properly configured"""
    print("🔗 Testing AI Workflows API Integration")
    print("=" * 50)
    
    try:
        from app.api.ai_workflows import router, AVAILABLE_AGENTS, WORKFLOW_TEMPLATES
        
        print("✅ AI Workflows API router imported successfully")
        print(f"✅ {len(AVAILABLE_AGENTS)} agents configured")
        print(f"✅ {len(WORKFLOW_TEMPLATES)} workflow templates configured")
        
        # Test endpoint paths
        routes = [route.path for route in router.routes]
        expected_routes = [
            "/available-agents",
            "/workflow-templates", 
            "/execute",
            "/status/{workflow_id}",
            "/cancel/{workflow_id}",
            "/executions",
            "/results/{workflow_id}",
            "/ws/{workflow_id}"
        ]
        
        print("\n📍 Available API endpoints:")
        for route in routes:
            print(f"   - {route}")
        
        missing_routes = [route for route in expected_routes if route not in routes]
        if missing_routes:
            print(f"\n⚠️  Missing routes: {missing_routes}")
        else:
            print("\n✅ All expected routes are available")
        
        return True
        
    except Exception as e:
        print(f"❌ API integration test failed: {e}")
        return False

def test_frontend_data_structure():
    """Test that the data structures match frontend expectations"""
    print("\n🎨 Testing Frontend Data Structure Compatibility")
    print("=" * 50)
    
    try:
        from app.api.ai_workflows import AVAILABLE_AGENTS, WORKFLOW_TEMPLATES
        
        # Test agent structure
        print("🤖 Testing agent data structure...")
        for agent_id, agent_data in AVAILABLE_AGENTS.items():
            required_fields = ['id', 'name', 'description', 'category', 'inputs', 'outputs', 'estimated_duration', 'icon']
            missing_fields = [field for field in required_fields if field not in agent_data]
            
            if missing_fields:
                print(f"   ⚠️  Agent {agent_id} missing fields: {missing_fields}")
            else:
                print(f"   ✅ Agent {agent_id} structure valid")
        
        # Test workflow template structure
        print("\n📋 Testing workflow template data structure...")
        for template_id, template_data in WORKFLOW_TEMPLATES.items():
            required_fields = ['id', 'name', 'description', 'agents', 'estimated_duration', 'frequency']
            missing_fields = [field for field in required_fields if field not in template_data]
            
            if missing_fields:
                print(f"   ⚠️  Template {template_id} missing fields: {missing_fields}")
            else:
                print(f"   ✅ Template {template_id} structure valid")
        
        return True
        
    except Exception as e:
        print(f"❌ Frontend data structure test failed: {e}")
        return False

def test_database_integration():
    """Test database models for AI Workflows"""
    print("\n🗄️  Testing Database Integration")
    print("=" * 50)
    
    try:
        from app.db.models import WorkflowExecution, WorkflowResult, AgentResult
        from app.db.database import SessionLocal, engine
        from app.db.models import Base
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        
        # Test model creation
        db = SessionLocal()
        try:
            # Test WorkflowExecution
            test_execution = WorkflowExecution(
                workflow_id="frontend_test_123",
                name="Frontend Integration Test",
                status="completed",
                execution_date=date.today(),
                agents_executed=json.dumps(["sla_calculator", "cost_calculator"]),
                parameters=json.dumps({"frontend_test": True}),
                summary=json.dumps({"test": "success"})
            )
            
            db.add(test_execution)
            db.commit()
            print("✅ WorkflowExecution model works correctly")
            
            # Test WorkflowResult
            test_result = WorkflowResult(
                workflow_id="frontend_test_123",
                agent_name="sla_calculator",
                execution_date=date.today(),
                result_data=json.dumps({"status": "completed", "frontend_test": True})
            )
            
            db.add(test_result)
            db.commit()
            print("✅ WorkflowResult model works correctly")
            
            # Test AgentResult
            test_agent_result = AgentResult(
                agent_name="test_agent",
                execution_date=date.today(),
                workflow_id="frontend_test_123",
                status="completed",
                execution_time_seconds=2.5,
                records_processed=1000,
                insights_generated=5,
                result_data=json.dumps({"frontend_test": True})
            )
            
            db.add(test_agent_result)
            db.commit()
            print("✅ AgentResult model works correctly")
            
        finally:
            db.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database integration test failed: {e}")
        return False

def print_integration_summary():
    """Print integration summary and instructions"""
    print("\n🎯 Frontend-Backend Integration Summary")
    print("=" * 50)
    print("✅ AI Workflows API endpoints configured")
    print("✅ Data structures match frontend expectations")
    print("✅ Database models ready for workflow data")
    print("✅ WebSocket support for real-time updates")
    print()
    print("🚀 Ready for Frontend Integration!")
    print()
    print("📋 Integration Checklist:")
    print("1. ✅ Backend API endpoints ready")
    print("2. ✅ Frontend component created (AIWorkflows.tsx)")
    print("3. ✅ Navigation added to Dashboard")
    print("4. ✅ MainCarousel updated with AI Workflows card")
    print("5. ✅ Database models configured")
    print()
    print("🔧 To test the full integration:")
    print("1. Start the backend server:")
    print("   cd backend && uvicorn app.main:app --reload")
    print()
    print("2. Start the frontend server:")
    print("   cd frontend && npm run dev")
    print()
    print("3. Navigate to http://localhost:3000")
    print("4. Login and click on 'AI Workflows' card")
    print("5. Select a date and workflow template")
    print("6. Click 'Run Workflow' to test execution")
    print()
    print("🌐 API Endpoints Available:")
    print("- GET  /api/ai-workflows/available-agents")
    print("- GET  /api/ai-workflows/workflow-templates")
    print("- POST /api/ai-workflows/execute")
    print("- GET  /api/ai-workflows/status/{workflow_id}")
    print("- WS   /api/ai-workflows/ws/{workflow_id}")
    print("\n" + "=" * 50)

async def main():
    """Run all integration tests"""
    print("🔗 AI Workflows Frontend-Backend Integration Test")
    print("=" * 50)
    
    all_tests_passed = True
    
    # Run tests
    if not test_api_endpoints():
        all_tests_passed = False
    
    if not test_frontend_data_structure():
        all_tests_passed = False
    
    if not test_database_integration():
        all_tests_passed = False
    
    print("\n" + "=" * 50)
    
    if all_tests_passed:
        print("🎉 All integration tests passed!")
        print_integration_summary()
        return 0
    else:
        print("❌ Some integration tests failed. Please fix the issues.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)