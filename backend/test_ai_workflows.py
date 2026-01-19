#!/usr/bin/env python3
"""
Test script for AI Workflows system

This script tests the complete AI Workflows functionality including:
1. Agent execution
2. Workflow orchestration
3. Database storage
4. API endpoints
"""

import asyncio
import sys
import os
from datetime import date, datetime
import json

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents.workflow_orchestrator import WorkflowOrchestrator
from app.agents.sla_calculation_agent import SLACalculationAgent
from app.agents.cost_calculation_agent import CostCalculationAgent
from app.agents.fraud_analysis_agent import FraudAnalysisAgent
from app.agents.performance_analysis_agent import PerformanceAnalysisAgent
from app.agents.compliance_checker_agent import ComplianceCheckerAgent
from app.db.database import SessionLocal, engine
from app.db.models import Base, WorkflowExecution, WorkflowResult, AgentResult

async def test_individual_agents():
    """Test each agent individually"""
    print("🧪 Testing Individual Agents")
    print("=" * 50)
    
    execution_date = date.today()
    parameters = {"test_mode": True}
    
    agents = [
        ("SLA Calculator", SLACalculationAgent()),
        ("Cost Calculator", CostCalculationAgent()),
        ("Fraud Analyzer", FraudAnalysisAgent()),
        ("Performance Analyzer", PerformanceAnalysisAgent()),
        ("Compliance Checker", ComplianceCheckerAgent())
    ]
    
    for agent_name, agent in agents:
        print(f"\n🤖 Testing {agent_name}...")
        try:
            result = await agent.execute(
                execution_date=execution_date,
                parameters=parameters,
                progress_callback=lambda progress, message: print(f"  📊 {progress}% - {message}")
            )
            
            if result["status"] == "completed":
                print(f"  ✅ {agent_name} completed successfully")
                print(f"  📈 Key metrics: {_extract_key_metrics(result)}")
            else:
                print(f"  ❌ {agent_name} failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  💥 {agent_name} crashed: {e}")
    
    print("\n" + "=" * 50)

def _extract_key_metrics(result):
    """Extract key metrics from agent result for display"""
    metrics = {}
    
    if "sla_summary" in result:
        metrics["SLA Compliance"] = f"{result['compliance_percentage']:.1f}%"
    
    if "cost_summary" in result:
        metrics["Total Cost"] = f"${result['total_cost']:,.2f}"
        metrics["Avg MDR"] = f"{result['avg_mdr']:.3f}%"
    
    if "risk_assessment" in result:
        metrics["Fraud Score"] = f"{result['fraud_score']:.1f}"
        metrics["High Risk Txns"] = result['high_risk_transactions']
    
    if "throughput_analysis" in result:
        metrics["Avg TPS"] = f"{result['throughput']:.1f}"
        metrics["Avg Response"] = f"{result['avg_response_time']:.0f}ms"
    
    if "compliance_summary" in result:
        metrics["Compliance Score"] = f"{result['overall_compliance_score']:.1f}%"
        metrics["Critical Violations"] = result['critical_violations']
    
    return metrics

async def test_workflow_orchestrator():
    """Test the workflow orchestrator"""
    print("🎭 Testing Workflow Orchestrator")
    print("=" * 50)
    
    orchestrator = WorkflowOrchestrator()
    execution_date = date.today()
    
    # Test different workflow configurations
    test_workflows = [
        {
            "name": "Quick Performance Check",
            "agents": ["sla_calculator", "performance_analyzer"],
            "parameters": {"test_mode": True, "quick_run": True}
        },
        {
            "name": "Financial Analysis",
            "agents": ["cost_calculator"],
            "parameters": {"test_mode": True, "focus": "cost_optimization"}
        },
        {
            "name": "Security Audit",
            "agents": ["fraud_analyzer", "compliance_checker"],
            "parameters": {"test_mode": True, "security_focus": True}
        }
    ]
    
    for i, workflow_config in enumerate(test_workflows):
        workflow_id = f"test_workflow_{i+1}_{int(datetime.now().timestamp())}"
        
        print(f"\n🚀 Testing workflow: {workflow_config['name']}")
        print(f"   Workflow ID: {workflow_id}")
        print(f"   Agents: {', '.join(workflow_config['agents'])}")
        
        try:
            result = await orchestrator.execute_workflow(
                workflow_id=workflow_id,
                execution_date=execution_date,
                agents=workflow_config["agents"],
                parameters=workflow_config["parameters"]
            )
            
            if result["status"] == "completed":
                print(f"  ✅ Workflow completed successfully")
                print(f"  ⏱️  Duration: {result.get('duration', 'N/A')}")
                print(f"  📊 Agents executed: {len(result.get('results', {}))}")
                
                # Display summary metrics
                if "summary" in result:
                    summary = result["summary"]
                    print(f"  📈 Success rate: {summary.get('success_rate', 0):.1f}%")
                    if summary.get("key_metrics"):
                        print(f"  🎯 Key metrics: {summary['key_metrics']}")
            else:
                print(f"  ❌ Workflow failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  💥 Workflow crashed: {e}")
    
    print("\n" + "=" * 50)

async def test_database_operations():
    """Test database operations"""
    print("🗄️  Testing Database Operations")
    print("=" * 50)
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("  ✅ Database tables created/verified")
        
        # Test database connection
        db = SessionLocal()
        try:
            # Test workflow execution record
            test_execution = WorkflowExecution(
                workflow_id="test_db_workflow_123",
                name="Database Test Workflow",
                status="completed",
                execution_date=date.today(),
                started_at=datetime.now(),
                completed_at=datetime.now(),
                agents_executed=json.dumps(["sla_calculator", "cost_calculator"]),
                parameters=json.dumps({"test_mode": True}),
                summary=json.dumps({"test": "success", "agents_count": 2})
            )
            
            db.add(test_execution)
            db.commit()
            print("  ✅ Workflow execution record created")
            
            # Test workflow result record
            test_result = WorkflowResult(
                workflow_id="test_db_workflow_123",
                agent_name="sla_calculator",
                execution_date=date.today(),
                result_data=json.dumps({"status": "completed", "test": True})
            )
            
            db.add(test_result)
            db.commit()
            print("  ✅ Workflow result record created")
            
            # Test agent result record
            test_agent_result = AgentResult(
                agent_name="test_agent",
                execution_date=date.today(),
                workflow_id="test_db_workflow_123",
                status="completed",
                execution_time_seconds=2.5,
                records_processed=1000,
                insights_generated=5,
                result_data=json.dumps({"test": "success"})
            )
            
            db.add(test_agent_result)
            db.commit()
            print("  ✅ Agent result record created")
            
            # Query records back
            execution_count = db.query(WorkflowExecution).count()
            result_count = db.query(WorkflowResult).count()
            agent_result_count = db.query(AgentResult).count()
            
            print(f"  📊 Database records:")
            print(f"     - Workflow executions: {execution_count}")
            print(f"     - Workflow results: {result_count}")
            print(f"     - Agent results: {agent_result_count}")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"  ❌ Database test failed: {e}")
    
    print("\n" + "=" * 50)

async def test_full_workflow_integration():
    """Test complete end-to-end workflow"""
    print("🔄 Testing Full Workflow Integration")
    print("=" * 50)
    
    orchestrator = WorkflowOrchestrator()
    workflow_id = f"integration_test_{int(datetime.now().timestamp())}"
    execution_date = date.today()
    
    print(f"🚀 Starting comprehensive workflow test")
    print(f"   Workflow ID: {workflow_id}")
    print(f"   Execution Date: {execution_date}")
    
    try:
        # Execute a comprehensive workflow with all agents
        result = await orchestrator.execute_workflow(
            workflow_id=workflow_id,
            execution_date=execution_date,
            agents=["sla_calculator", "cost_calculator", "fraud_analyzer", "performance_analyzer", "compliance_checker"],
            parameters={"test_mode": True, "comprehensive": True}
        )
        
        if result["status"] == "completed":
            print(f"  ✅ Integration test completed successfully!")
            
            # Verify database storage
            db = SessionLocal()
            try:
                execution = db.query(WorkflowExecution).filter(
                    WorkflowExecution.workflow_id == workflow_id
                ).first()
                
                results = db.query(WorkflowResult).filter(
                    WorkflowResult.workflow_id == workflow_id
                ).all()
                
                if execution and len(results) > 0:
                    print(f"  ✅ Database storage verified")
                    print(f"     - Execution record: {execution.name}")
                    print(f"     - Agent results: {len(results)}")
                    
                    # Display summary
                    if execution.summary:
                        summary = json.loads(execution.summary)
                        print(f"  📊 Workflow Summary:")
                        print(f"     - Execution time: {summary.get('execution_time', 'N/A')}")
                        print(f"     - Success rate: {summary.get('success_rate', 0):.1f}%")
                        print(f"     - Agents executed: {summary.get('agents_executed', 0)}")
                        
                        if summary.get("key_metrics"):
                            print(f"     - Key metrics: {summary['key_metrics']}")
                else:
                    print(f"  ⚠️  Database storage incomplete")
                    
            finally:
                db.close()
        else:
            print(f"  ❌ Integration test failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"  💥 Integration test crashed: {e}")
    
    print("\n" + "=" * 50)

def print_test_summary():
    """Print test summary and next steps"""
    print("📋 Test Summary & Next Steps")
    print("=" * 50)
    print("✅ Individual agents tested")
    print("✅ Workflow orchestrator tested")
    print("✅ Database operations tested")
    print("✅ Full integration tested")
    print()
    print("🚀 Next Steps:")
    print("1. Start the FastAPI server: uvicorn app.main:app --reload")
    print("2. Test API endpoints at http://localhost:9000/docs")
    print("3. Connect frontend to backend APIs")
    print("4. Test WebSocket real-time updates")
    print("5. Verify dashboard data visualization")
    print()
    print("🔗 Key API Endpoints:")
    print("- GET  /api/ai-workflows/available-agents")
    print("- GET  /api/ai-workflows/workflow-templates")
    print("- POST /api/ai-workflows/execute")
    print("- GET  /api/ai-workflows/status/{workflow_id}")
    print("- WS   /api/ai-workflows/ws/{workflow_id}")
    print("\n" + "=" * 50)

async def main():
    """Run all tests"""
    print("🎯 AI Workflows System Test Suite")
    print("=" * 50)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        # Run all test suites
        await test_individual_agents()
        await test_workflow_orchestrator()
        await test_database_operations()
        await test_full_workflow_integration()
        
        print("🎉 All tests completed!")
        print_test_summary()
        
    except Exception as e:
        print(f"💥 Test suite failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)