#!/usr/bin/env python3
"""
Test script to verify the FastAPI server can start with AI Workflows endpoints
"""

import sys
import os
import asyncio
from datetime import date

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from app.api.ai_workflows import router
        print("  ✅ AI Workflows API imported successfully")
        
        from app.agents.workflow_orchestrator import WorkflowOrchestrator
        print("  ✅ Workflow Orchestrator imported successfully")
        
        from app.agents.sla_calculation_agent import SLACalculationAgent
        from app.agents.cost_calculation_agent import CostCalculationAgent
        from app.agents.fraud_analysis_agent import FraudAnalysisAgent
        from app.agents.performance_analysis_agent import PerformanceAnalysisAgent
        from app.agents.compliance_checker_agent import ComplianceCheckerAgent
        print("  ✅ All specialized agents imported successfully")
        
        from app.db.models import WorkflowExecution, WorkflowResult, AgentResult
        print("  ✅ Database models imported successfully")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Import failed: {e}")
        return False

def test_api_configuration():
    """Test API configuration"""
    print("\n🔧 Testing API configuration...")
    
    try:
        from app.api.ai_workflows import AVAILABLE_AGENTS, WORKFLOW_TEMPLATES
        
        print(f"  ✅ Available agents: {len(AVAILABLE_AGENTS)}")
        for agent_id, agent_info in AVAILABLE_AGENTS.items():
            print(f"     - {agent_info['name']} ({agent_info['category']})")
        
        print(f"  ✅ Workflow templates: {len(WORKFLOW_TEMPLATES)}")
        for template_id, template_info in WORKFLOW_TEMPLATES.items():
            print(f"     - {template_info['name']} ({len(template_info['agents'])} agents)")
        
        return True
        
    except Exception as e:
        print(f"  ❌ API configuration test failed: {e}")
        return False

async def test_orchestrator_initialization():
    """Test orchestrator initialization"""
    print("\n🎭 Testing orchestrator initialization...")
    
    try:
        from app.agents.workflow_orchestrator import WorkflowOrchestrator
        
        orchestrator = WorkflowOrchestrator()
        print(f"  ✅ Orchestrator initialized with {len(orchestrator.agents)} agents")
        
        # Test agent availability
        for agent_type, agent in orchestrator.agents.items():
            print(f"     - {agent_type}: {agent.name}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Orchestrator initialization failed: {e}")
        return False

def test_database_models():
    """Test database model creation"""
    print("\n🗄️  Testing database models...")
    
    try:
        from app.db.database import engine
        from app.db.models import Base, WorkflowExecution, WorkflowResult, AgentResult
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("  ✅ Database tables created successfully")
        
        # Test model instantiation
        workflow = WorkflowExecution(
            workflow_id="test_123",
            name="Test Workflow",
            status="pending",
            execution_date=date.today()
        )
        print("  ✅ WorkflowExecution model instantiated")
        
        result = WorkflowResult(
            workflow_id="test_123",
            agent_name="test_agent",
            execution_date=date.today()
        )
        print("  ✅ WorkflowResult model instantiated")
        
        agent_result = AgentResult(
            agent_name="test_agent",
            execution_date=date.today(),
            status="completed"
        )
        print("  ✅ AgentResult model instantiated")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Database model test failed: {e}")
        return False

def print_startup_instructions():
    """Print instructions for starting the server"""
    print("\n🚀 Server Startup Instructions")
    print("=" * 50)
    print("To start the FastAPI server with AI Workflows:")
    print()
    print("1. Navigate to the backend directory:")
    print("   cd backend")
    print()
    print("2. Install dependencies (if not already done):")
    print("   pip install fastapi uvicorn sqlalchemy")
    print()
    print("3. Start the server:")
    print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("4. Access the API documentation:")
    print("   http://localhost:8000/docs")
    print()
    print("5. Test AI Workflows endpoints:")
    print("   - GET  http://localhost:8000/api/ai-workflows/available-agents")
    print("   - GET  http://localhost:8000/api/ai-workflows/workflow-templates")
    print("   - POST http://localhost:8000/api/ai-workflows/execute")
    print()
    print("6. Connect frontend to backend:")
    print("   - Update frontend API calls to use correct backend URL")
    print("   - Test WebSocket connections for real-time updates")
    print()
    print("=" * 50)

async def main():
    """Run all tests"""
    print("🎯 AI Workflows Server Startup Test")
    print("=" * 50)
    
    all_tests_passed = True
    
    # Run tests
    if not test_imports():
        all_tests_passed = False
    
    if not test_api_configuration():
        all_tests_passed = False
    
    if not await test_orchestrator_initialization():
        all_tests_passed = False
    
    if not test_database_models():
        all_tests_passed = False
    
    print("\n" + "=" * 50)
    
    if all_tests_passed:
        print("🎉 All tests passed! Server is ready to start.")
        print_startup_instructions()
        return 0
    else:
        print("❌ Some tests failed. Please fix the issues before starting the server.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)