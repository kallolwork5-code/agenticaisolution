#!/usr/bin/env python3
"""
Test script to check agent imports
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_agent_imports():
    """Test importing each agent individually"""
    print("Testing agent imports...")
    
    try:
        from app.agents.sla_calculation_agent import SLACalculationAgent
        print("✅ SLACalculationAgent imported successfully")
    except Exception as e:
        print(f"❌ SLACalculationAgent import failed: {e}")
        return False
    
    try:
        from app.agents.routing_optimization_agent import RoutingOptimizationAgent
        print("✅ RoutingOptimizationAgent imported successfully")
    except Exception as e:
        print(f"❌ RoutingOptimizationAgent import failed: {e}")
        return False
    
    try:
        from app.agents.settlement_analysis_agent import SettlementAnalysisAgent
        print("✅ SettlementAnalysisAgent imported successfully")
    except Exception as e:
        print(f"❌ SettlementAnalysisAgent import failed: {e}")
        return False
    
    return True

def test_agent_initialization():
    """Test initializing each agent"""
    print("\nTesting agent initialization...")
    
    try:
        from app.agents.sla_calculation_agent import SLACalculationAgent
        agent = SLACalculationAgent()
        print(f"✅ SLACalculationAgent initialized: {agent.name}")
    except Exception as e:
        print(f"❌ SLACalculationAgent initialization failed: {e}")
        return False
    
    try:
        from app.agents.routing_optimization_agent import RoutingOptimizationAgent
        agent = RoutingOptimizationAgent()
        print(f"✅ RoutingOptimizationAgent initialized: {agent.name}")
    except Exception as e:
        print(f"❌ RoutingOptimizationAgent initialization failed: {e}")
        return False
    
    try:
        from app.agents.settlement_analysis_agent import SettlementAnalysisAgent
        agent = SettlementAnalysisAgent()
        print(f"✅ SettlementAnalysisAgent initialized: {agent.name}")
    except Exception as e:
        print(f"❌ SettlementAnalysisAgent initialization failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🧪 Testing AI Workflow Agents")
    print("=" * 40)
    
    if test_agent_imports():
        if test_agent_initialization():
            print("\n🎉 All agents working correctly!")
        else:
            print("\n❌ Agent initialization failed")
    else:
        print("\n❌ Agent imports failed")