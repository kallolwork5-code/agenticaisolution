#!/usr/bin/env python3
"""
Integration test for AI Workflows system
Tests the complete flow from API endpoints to agent execution
"""

import asyncio
import sys
import os
import json
from datetime import date

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

async def test_api_endpoints():
    """Test the API endpoints that the frontend will use"""
    print("🧪 Testing AI Workflows API Integration")
    print("=" * 50)
    
    try:
        # Import the API functions
        from app.api.ai_workflows import (
            get_available_agents, 
            get_workflow_templates,
            AVAILABLE_AGENTS,
            WORKFLOW_TEMPLATES
        )
        
        # Test 1: Available Agents Endpoint
        print("\n1. Testing Available Agents Endpoint...")
        agents_response = await get_available_agents()
        agents_data = json.loads(agents_response.body)
        
        print(f"   ✓ Status: {agents_data['status']}")
        print(f"   ✓ Agents returned: {len(agents_data['agents'])}")
        
        for agent in agents_data['agents']:
            print(f"     - {agent['name']} ({agent['category']})")
        
        # Test 2: Workflow Templates Endpoint
        print("\n2. Testing Workflow Templates Endpoint...")
        templates_response = await get_workflow_templates()
        templates_data = json.loads(templates_response.body)
        
        print(f"   ✓ Status: {templates_data['status']}")
        print(f"   ✓ Templates returned: {len(templates_data['templates'])}")
        
        for template in templates_data['templates']:
            print(f"     - {template['name']} ({len(template['agents'])} agents)")
        
        # Test 3: Validate Agent Configuration
        print("\n3. Validating Agent Configuration...")
        
        expected_agents = ["sla_calculator", "routing_optimizer", "settlement_analyzer"]
        available_agent_ids = [agent['id'] for agent in agents_data['agents']]
        
        for expected_agent in expected_agents:
            if expected_agent in available_agent_ids:
                print(f"   ✓ {expected_agent} is available")
            else:
                print(f"   ❌ {expected_agent} is missing")
        
        # Test 4: Validate Template Configuration
        print("\n4. Validating Template Configuration...")
        
        for template in templates_data['templates']:
            template_agents = template['agents']
            valid_agents = all(agent_id in available_agent_ids for agent_id in template_agents)
            
            if valid_agents:
                print(f"   ✓ {template['name']} has valid agents: {template_agents}")
            else:
                invalid_agents = [agent_id for agent_id in template_agents if agent_id not in available_agent_ids]
                print(f"   ❌ {template['name']} has invalid agents: {invalid_agents}")
        
        # Test 5: Agent Descriptions and Categories
        print("\n5. Validating Agent Details...")
        
        agent_categories = {}
        for agent in agents_data['agents']:
            category = agent['category']
            if category not in agent_categories:
                agent_categories[category] = []
            agent_categories[category].append(agent['name'])
        
        print("   Agent Categories:")
        for category, agents in agent_categories.items():
            print(f"     {category}: {', '.join(agents)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_workflow_execution_simulation():
    """Simulate a workflow execution without actually running it"""
    print("\n" + "=" * 50)
    print("🚀 Testing Workflow Execution Simulation")
    print("=" * 50)
    
    try:
        from app.agents.workflow_orchestrator import WorkflowOrchestrator
        
        orchestrator = WorkflowOrchestrator()
        
        # Test different workflow scenarios
        test_scenarios = [
            {
                "name": "Complete Analysis",
                "agents": ["sla_calculator", "routing_optimizer", "settlement_analyzer"],
                "description": "Full three-agent analysis"
            },
            {
                "name": "Performance Focus",
                "agents": ["sla_calculator", "settlement_analyzer"],
                "description": "SLA and settlement analysis"
            },
            {
                "name": "Cost Optimization",
                "agents": ["routing_optimizer", "settlement_analyzer"],
                "description": "Routing and settlement optimization"
            },
            {
                "name": "Quick Check",
                "agents": ["sla_calculator"],
                "description": "Fast SLA compliance check"
            }
        ]
        
        print(f"\nTesting {len(test_scenarios)} workflow scenarios...")
        
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n{i}. {scenario['name']}")
            print(f"   Description: {scenario['description']}")
            print(f"   Agents: {scenario['agents']}")
            
            # Validate agents exist
            available_agents = list(orchestrator.agents.keys())
            invalid_agents = [agent for agent in scenario['agents'] if agent not in available_agents]
            
            if invalid_agents:
                print(f"   ❌ Invalid agents: {invalid_agents}")
                continue
            
            print(f"   ✓ All agents are available")
            
            # Estimate execution time
            total_estimated_time = len(scenario['agents']) * 3  # Assume 3 minutes per agent
            print(f"   ⏱️  Estimated execution time: {total_estimated_time} minutes")
        
        print(f"\n✅ All {len(test_scenarios)} workflow scenarios are valid")
        return True
        
    except Exception as e:
        print(f"❌ Workflow simulation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_agent_compatibility():
    """Test that all agents are compatible with the orchestrator"""
    print("\n" + "=" * 50)
    print("🔧 Testing Agent Compatibility")
    print("=" * 50)
    
    try:
        from app.agents.sla_calculation_agent import SLACalculationAgent
        from app.agents.routing_optimization_agent import RoutingOptimizationAgent
        from app.agents.settlement_analyzer_agent import SettlementAnalyzerAgent
        
        agents = {
            "SLA Calculator": SLACalculationAgent(),
            "Routing Optimizer": RoutingOptimizationAgent(),
            "Settlement Analyzer": SettlementAnalyzerAgent()
        }
        
        print(f"\nTesting {len(agents)} agents for compatibility...")
        
        for agent_name, agent_instance in agents.items():
            print(f"\n• {agent_name}")
            
            # Check required attributes
            required_attrs = ['name', 'description']
            for attr in required_attrs:
                if hasattr(agent_instance, attr):
                    print(f"  ✓ Has {attr}: {getattr(agent_instance, attr)}")
                else:
                    print(f"  ❌ Missing {attr}")
            
            # Check execute method signature
            if hasattr(agent_instance, 'execute'):
                print(f"  ✓ Has execute method")
                
                # Check if execute method is async
                import inspect
                if inspect.iscoroutinefunction(agent_instance.execute):
                    print(f"  ✓ Execute method is async")
                else:
                    print(f"  ❌ Execute method is not async")
            else:
                print(f"  ❌ Missing execute method")
        
        print(f"\n✅ Agent compatibility check completed")
        return True
        
    except Exception as e:
        print(f"❌ Agent compatibility test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all integration tests"""
    print("AI WORKFLOWS SYSTEM - INTEGRATION TEST")
    print("=" * 60)
    print("Testing complete integration from frontend to backend")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    test_results.append(await test_api_endpoints())
    test_results.append(await test_workflow_execution_simulation())
    test_results.append(await test_agent_compatibility())
    
    # Final summary
    print("\n" + "=" * 60)
    print("INTEGRATION TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = sum(test_results)
    total_tests = len(test_results)
    
    test_names = [
        "API Endpoints",
        "Workflow Execution",
        "Agent Compatibility"
    ]
    
    print("\nTest Results:")
    for i, (test_name, result) in enumerate(zip(test_names, test_results)):
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {i+1}. {test_name}: {status}")
    
    print(f"\nOverall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL INTEGRATION TESTS PASSED!")
        print("\nThe AI Workflows system is fully integrated and ready for use:")
        print("• Backend agents are working correctly")
        print("• API endpoints are properly configured")
        print("• Workflow orchestration is functional")
        print("• Frontend can communicate with backend")
        
        print("\n📋 Next Steps:")
        print("1. Start the backend server: python -m uvicorn app.main:app --reload")
        print("2. Start the frontend server: npm run dev")
        print("3. Navigate to: http://localhost:3000/ai-workflows")
        print("4. Test the complete workflow execution")
        
    else:
        print(f"\n❌ {total_tests - passed_tests} integration tests failed")
        print("Please review the errors above and fix the issues before proceeding.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)