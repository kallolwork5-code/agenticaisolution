#!/usr/bin/env python3
"""
Test script for the complete AI Workflows system with three agents:
1. SLA Calculator Agent
2. Routing Optimization Agent  
3. Settlement Analysis Agent
"""

import asyncio
import sys
import os
from datetime import date, datetime

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.agents.sla_calculation_agent import SLACalculationAgent
from app.agents.routing_optimization_agent import RoutingOptimizationAgent
from app.agents.settlement_analyzer_agent import SettlementAnalyzerAgent
from app.agents.workflow_orchestrator import WorkflowOrchestrator

async def test_individual_agents():
    """Test each agent individually"""
    print("=" * 60)
    print("TESTING INDIVIDUAL AGENTS")
    print("=" * 60)
    
    execution_date = date.today()
    parameters = {}
    
    # Test SLA Calculator Agent
    print("\n1. Testing SLA Calculator Agent...")
    sla_agent = SLACalculationAgent()
    sla_result = await sla_agent.execute(execution_date, parameters)
    print(f"   Status: {sla_result['status']}")
    if sla_result['status'] == 'completed':
        print(f"   SLA Compliance: {sla_result['compliance_percentage']:.1f}%")
        print(f"   Avg Response Time: {sla_result['avg_response_time']:.1f}ms")
        print(f"   Uptime: {sla_result['uptime_percentage']:.2f}%")
        print(f"   SLA Breaches: {sla_result['sla_breaches']}")
    
    # Test Routing Optimization Agent
    print("\n2. Testing Routing Optimization Agent...")
    routing_agent = RoutingOptimizationAgent()
    routing_result = await routing_agent.execute(execution_date, parameters)
    print(f"   Status: {routing_result['status']}")
    if routing_result['status'] == 'completed':
        print(f"   Routing Efficiency: {routing_result['routing_efficiency']:.1f}%")
        print(f"   Potential Savings: ${routing_result['total_potential_savings']:.2f}")
        print(f"   Optimal Routing: {routing_result['optimal_routing_percentage']:.1f}%")
    
    # Test Settlement Analysis Agent
    print("\n3. Testing Settlement Analysis Agent...")
    settlement_agent = SettlementAnalyzerAgent()
    settlement_result = await settlement_agent.execute(execution_date, parameters)
    print(f"   Status: {settlement_result['status']}")
    if settlement_result['status'] == 'completed':
        print(f"   Settlement Accuracy: {settlement_result['settlement_accuracy']:.1f}%")
        print(f"   Discrepancies Found: {settlement_result['discrepancies_found']}")
        print(f"   Reconciliation Rate: {settlement_result['reconciliation_rate']:.1f}%")
    
    return sla_result, routing_result, settlement_result

async def test_workflow_orchestrator():
    """Test the workflow orchestrator with all three agents"""
    print("\n" + "=" * 60)
    print("TESTING WORKFLOW ORCHESTRATOR")
    print("=" * 60)
    
    orchestrator = WorkflowOrchestrator()
    
    # Test workflow execution
    workflow_id = "test_workflow_001"
    execution_date = date.today()
    agents = ["sla_calculator", "routing_optimizer", "settlement_analyzer"]
    parameters = {"test_mode": True}
    
    print(f"\nExecuting workflow with agents: {agents}")
    
    workflow_result = await orchestrator.execute_workflow(
        workflow_id=workflow_id,
        execution_date=execution_date,
        agents=agents,
        parameters=parameters
    )
    
    print(f"Workflow Status: {workflow_result['status']}")
    print(f"Execution Time: {workflow_result.get('completed_at', 'N/A') if workflow_result.get('completed_at') else 'N/A'}")
    print(f"Overall Progress: {workflow_result['overall_progress']}%")
    
    if workflow_result['status'] == 'completed':
        print("\nAgent Results Summary:")
        for agent_name, result in workflow_result['results'].items():
            print(f"  {agent_name}: {result.get('status', 'unknown')}")
        
        if 'summary' in workflow_result:
            summary = workflow_result['summary']
            print(f"\nWorkflow Summary:")
            print(f"  Agents Executed: {summary.get('agents_executed', 0)}")
            print(f"  Success Rate: {summary.get('success_rate', 0):.1f}%")
            print(f"  Key Recommendations: {len(summary.get('recommendations', []))}")
    
    return workflow_result

async def test_comprehensive_workflow():
    """Test a comprehensive workflow scenario"""
    print("\n" + "=" * 60)
    print("TESTING COMPREHENSIVE WORKFLOW SCENARIO")
    print("=" * 60)
    
    orchestrator = WorkflowOrchestrator()
    
    # Simulate different workflow templates
    workflows = [
        {
            "name": "Daily Operations Analysis",
            "agents": ["sla_calculator", "routing_optimizer", "settlement_analyzer"],
            "description": "Complete daily analysis"
        },
        {
            "name": "SLA Performance Review", 
            "agents": ["sla_calculator", "settlement_analyzer"],
            "description": "Focus on SLA and settlement performance"
        },
        {
            "name": "Routing Optimization",
            "agents": ["routing_optimizer", "settlement_analyzer"], 
            "description": "Analyze routing and cost optimization"
        },
        {
            "name": "Quick Health Check",
            "agents": ["sla_calculator"],
            "description": "Fast SLA compliance check"
        }
    ]
    
    results = []
    
    for i, workflow_config in enumerate(workflows):
        print(f"\n{i+1}. Testing {workflow_config['name']}...")
        print(f"   Description: {workflow_config['description']}")
        print(f"   Agents: {workflow_config['agents']}")
        
        workflow_id = f"test_workflow_{i+1:03d}"
        
        result = await orchestrator.execute_workflow(
            workflow_id=workflow_id,
            execution_date=date.today(),
            agents=workflow_config['agents'],
            parameters={"workflow_type": workflow_config['name']}
        )
        
        print(f"   Status: {result['status']}")
        print(f"   Duration: {result.get('summary', {}).get('execution_time', 'N/A')}")
        
        results.append({
            "workflow": workflow_config['name'],
            "status": result['status'],
            "agents_count": len(workflow_config['agents']),
            "success": result['status'] == 'completed'
        })
    
    # Summary
    print(f"\n" + "=" * 40)
    print("COMPREHENSIVE TEST SUMMARY")
    print("=" * 40)
    
    total_workflows = len(results)
    successful_workflows = len([r for r in results if r['success']])
    
    print(f"Total Workflows Tested: {total_workflows}")
    print(f"Successful Workflows: {successful_workflows}")
    print(f"Success Rate: {(successful_workflows/total_workflows)*100:.1f}%")
    
    print("\nWorkflow Results:")
    for result in results:
        status_icon = "✓" if result['success'] else "✗"
        print(f"  {status_icon} {result['workflow']} ({result['agents_count']} agents)")
    
    return results

async def main():
    """Main test function"""
    print("AI WORKFLOWS SYSTEM - COMPREHENSIVE TEST")
    print("=" * 60)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test 1: Individual agents
        sla_result, routing_result, settlement_result = await test_individual_agents()
        
        # Test 2: Workflow orchestrator
        workflow_result = await test_workflow_orchestrator()
        
        # Test 3: Comprehensive workflow scenarios
        comprehensive_results = await test_comprehensive_workflow()
        
        # Final summary
        print("\n" + "=" * 60)
        print("FINAL TEST SUMMARY")
        print("=" * 60)
        
        individual_tests = [
            ("SLA Calculator", sla_result['status'] == 'completed'),
            ("Routing Optimizer", routing_result['status'] == 'completed'),
            ("Settlement Analyzer", settlement_result['status'] == 'completed')
        ]
        
        print("Individual Agent Tests:")
        for name, success in individual_tests:
            status_icon = "✓" if success else "✗"
            print(f"  {status_icon} {name}")
        
        orchestrator_success = workflow_result['status'] == 'completed'
        print(f"\nWorkflow Orchestrator Test:")
        print(f"  {'✓' if orchestrator_success else '✗'} Multi-agent workflow execution")
        
        comprehensive_success = all(r['success'] for r in comprehensive_results)
        print(f"\nComprehensive Workflow Tests:")
        print(f"  {'✓' if comprehensive_success else '✗'} All workflow templates")
        
        overall_success = (
            all(success for _, success in individual_tests) and
            orchestrator_success and
            comprehensive_success
        )
        
        print(f"\nOVERALL RESULT: {'✓ ALL TESTS PASSED' if overall_success else '✗ SOME TESTS FAILED'}")
        
        if overall_success:
            print("\n🎉 AI Workflows system is ready for production!")
            print("\nNext steps:")
            print("1. Start the FastAPI server: python -m uvicorn app.main:app --reload")
            print("2. Access the AI Workflows UI at: http://localhost:3000/ai-workflows")
            print("3. Test the API endpoints at: http://localhost:9000/api/ai-workflows/")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())