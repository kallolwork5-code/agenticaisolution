"""
Workflow Orchestrator Agent

This agent is responsible for:
1. Coordinating execution of multiple agents based on prompts
2. Managing workflow state and progress
3. Handling agent dependencies and sequencing
4. Providing real-time updates via WebSocket
5. Storing results in database for dashboarding
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import json

from .sla_calculation_agent import SLACalculationAgent
from .routing_optimization_agent import RoutingOptimizationAgent
from .settlement_analyzer_agent import SettlementAnalyzerAgent
from ..db.database import SessionLocal
from ..db.models import WorkflowExecution, WorkflowResult

logger = logging.getLogger("workflow-orchestrator")

class WorkflowOrchestrator:
    """
    Orchestrates the execution of multiple AI agents in a coordinated workflow
    """
    
    def __init__(self):
        """Initialize the workflow orchestrator with available agents"""
        self.agents = {
            "sla_calculator": SLACalculationAgent(),
            "routing_optimizer": RoutingOptimizationAgent(),
            "settlement_analyzer": SettlementAnalyzerAgent()
        }
        
        self.active_workflows: Dict[str, Dict] = {}
        
        logger.info("Workflow Orchestrator initialized with agents: %s", list(self.agents.keys()))
    
    async def execute_workflow(self, 
                             workflow_id: str,
                             execution_date: date,
                             agents: List[str],
                             parameters: Dict[str, Any],
                             websocket_manager=None) -> Dict[str, Any]:
        """
        Execute a workflow with the specified agents
        """
        logger.info(f"Starting workflow {workflow_id} with agents: {agents}")
        
        # Initialize workflow state
        workflow_state = {
            "workflow_id": workflow_id,
            "status": "running",
            "execution_date": execution_date,
            "agents": agents,
            "parameters": parameters,
            "started_at": datetime.utcnow(),
            "steps": {},
            "results": {},
            "overall_progress": 0
        }
        
        self.active_workflows[workflow_id] = workflow_state
        
        try:
            # Send initial status update
            if websocket_manager:
                await websocket_manager.send_update(workflow_id, {
                    "type": "workflow_started",
                    "workflow_id": workflow_id,
                    "status": "running",
                    "message": f"Starting workflow with {len(agents)} agents",
                    "agents": agents
                })
            
            # Execute agents in sequence (could be parallelized based on dependencies)
            total_agents = len(agents)
            completed_agents = 0
            
            for i, agent_name in enumerate(agents):
                if workflow_id not in self.active_workflows:
                    # Workflow was cancelled
                    logger.info(f"Workflow {workflow_id} was cancelled")
                    return {"status": "cancelled"}
                
                logger.info(f"Executing agent {agent_name} ({i+1}/{total_agents})")
                
                # Update step status
                step_result = await self._execute_agent_step(
                    workflow_id=workflow_id,
                    agent_name=agent_name,
                    execution_date=execution_date,
                    parameters=parameters,
                    websocket_manager=websocket_manager
                )
                
                workflow_state["steps"][agent_name] = step_result
                workflow_state["results"][agent_name] = step_result.get("result", {})
                
                completed_agents += 1
                workflow_state["overall_progress"] = int((completed_agents / total_agents) * 100)
                
                # Send progress update
                if websocket_manager:
                    await websocket_manager.send_update(workflow_id, {
                        "type": "agent_completed",
                        "workflow_id": workflow_id,
                        "agent_name": agent_name,
                        "status": step_result["status"],
                        "progress": workflow_state["overall_progress"],
                        "result": step_result.get("result", {})
                    })
            
            # Workflow completed successfully
            workflow_state["status"] = "completed"
            workflow_state["completed_at"] = datetime.utcnow()
            
            # Generate workflow summary
            summary = await self._generate_workflow_summary(workflow_state)
            workflow_state["summary"] = summary
            
            # Store results in database
            await self._store_workflow_results(workflow_state)
            
            # Send completion update
            if websocket_manager:
                await websocket_manager.send_update(workflow_id, {
                    "type": "workflow_completed",
                    "workflow_id": workflow_id,
                    "status": "completed",
                    "summary": summary,
                    "duration": str(workflow_state["completed_at"] - workflow_state["started_at"])
                })
            
            logger.info(f"Workflow {workflow_id} completed successfully")
            return workflow_state
            
        except Exception as e:
            logger.error(f"Workflow {workflow_id} failed: {e}")
            
            # Update workflow state
            workflow_state["status"] = "failed"
            workflow_state["error"] = str(e)
            workflow_state["completed_at"] = datetime.utcnow()
            
            # Send error update
            if websocket_manager:
                await websocket_manager.send_update(workflow_id, {
                    "type": "workflow_failed",
                    "workflow_id": workflow_id,
                    "status": "failed",
                    "error": str(e)
                })
            
            return workflow_state
            
        finally:
            # Clean up active workflow
            if workflow_id in self.active_workflows:
                del self.active_workflows[workflow_id]
    
    async def _execute_agent_step(self,
                                workflow_id: str,
                                agent_name: str,
                                execution_date: date,
                                parameters: Dict[str, Any],
                                websocket_manager=None) -> Dict[str, Any]:
        """
        Execute a single agent step within the workflow
        """
        step_start = datetime.utcnow()
        
        try:
            # Send agent start update
            if websocket_manager:
                await websocket_manager.send_update(workflow_id, {
                    "type": "agent_started",
                    "workflow_id": workflow_id,
                    "agent_name": agent_name,
                    "status": "running",
                    "message": f"Starting {agent_name} execution"
                })
            
            # Get the agent instance
            if agent_name not in self.agents:
                raise ValueError(f"Unknown agent: {agent_name}")
            
            agent = self.agents[agent_name]
            
            # Execute the agent with progress updates
            async def progress_callback(progress, message):
                if websocket_manager:
                    await self._send_agent_progress(websocket_manager, workflow_id, agent_name, progress, message)
            
            result = await agent.execute(
                execution_date=execution_date,
                parameters=parameters,
                progress_callback=progress_callback if websocket_manager else None
            )
            
            step_end = datetime.utcnow()
            
            return {
                "agent_name": agent_name,
                "status": "completed",
                "start_time": step_start,
                "end_time": step_end,
                "duration": str(step_end - step_start),
                "result": result
            }
            
        except Exception as e:
            step_end = datetime.utcnow()
            logger.error(f"Agent {agent_name} failed: {e}")
            
            return {
                "agent_name": agent_name,
                "status": "failed",
                "start_time": step_start,
                "end_time": step_end,
                "duration": str(step_end - step_start),
                "error": str(e)
            }
    
    async def _send_agent_progress(self,
                                 websocket_manager,
                                 workflow_id: str,
                                 agent_name: str,
                                 progress: int,
                                 message: str):
        """Send agent progress update via WebSocket"""
        if websocket_manager:
            await websocket_manager.send_update(workflow_id, {
                "type": "agent_progress",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "progress": progress,
                "message": message
            })
    
    async def _generate_workflow_summary(self, workflow_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive summary of the workflow execution
        """
        results = workflow_state.get("results", {})
        
        summary = {
            "execution_time": str(workflow_state["completed_at"] - workflow_state["started_at"]),
            "agents_executed": len(workflow_state["agents"]),
            "success_rate": len([r for r in workflow_state["steps"].values() if r["status"] == "completed"]) / len(workflow_state["agents"]) * 100,
            "key_metrics": {},
            "recommendations": [],
            "dashboard_data": {}
        }
        
        # Aggregate key metrics from agent results
        if "sla_calculator" in results:
            sla_result = results["sla_calculator"]
            summary["key_metrics"]["sla_compliance"] = sla_result.get("compliance_percentage", 0)
            summary["key_metrics"]["avg_response_time"] = sla_result.get("avg_response_time", 0)
        
        if "cost_calculator" in results:
            cost_result = results["cost_calculator"]
            summary["key_metrics"]["total_cost"] = cost_result.get("total_cost", 0)
            summary["key_metrics"]["avg_mdr"] = cost_result.get("avg_mdr", 0)
        
        if "performance_analyzer" in results:
            perf_result = results["performance_analyzer"]
            summary["key_metrics"]["throughput"] = perf_result.get("throughput", 0)
            summary["key_metrics"]["error_rate"] = perf_result.get("error_rate", 0)
        
        # Generate recommendations based on results
        recommendations = []
        
        if summary["key_metrics"].get("sla_compliance", 100) < 95:
            recommendations.append("SLA compliance is below target. Review performance bottlenecks.")
        
        if summary["key_metrics"].get("error_rate", 0) > 0.05:
            recommendations.append("Error rate is elevated. Investigate system stability issues.")
        
        if summary["key_metrics"].get("avg_mdr", 0) > 2.5:
            recommendations.append("Average MDR is high. Consider renegotiating rates with acquirers.")
        
        summary["recommendations"] = recommendations
        
        # Prepare dashboard data
        summary["dashboard_data"] = {
            "charts": [
                {
                    "type": "gauge",
                    "title": "SLA Compliance",
                    "value": summary["key_metrics"].get("sla_compliance", 0),
                    "target": 95
                },
                {
                    "type": "metric",
                    "title": "Total Processing Cost",
                    "value": summary["key_metrics"].get("total_cost", 0),
                    "format": "currency"
                },
                {
                    "type": "metric", 
                    "title": "Average Response Time",
                    "value": summary["key_metrics"].get("avg_response_time", 0),
                    "format": "time"
                }
            ]
        }
        
        return summary
    
    async def _store_workflow_results(self, workflow_state: Dict[str, Any]):
        """
        Store workflow results in database for dashboarding
        """
        try:
            db = SessionLocal()
            
            # Store main workflow execution record
            workflow_execution = WorkflowExecution(
                workflow_id=workflow_state["workflow_id"],
                name=f"Workflow_{workflow_state['workflow_id'][:8]}",
                status=workflow_state["status"],
                execution_date=workflow_state["execution_date"],
                started_at=workflow_state["started_at"],
                completed_at=workflow_state.get("completed_at"),
                agents_executed=json.dumps(workflow_state["agents"]),
                parameters=json.dumps(workflow_state["parameters"]),
                summary=json.dumps(workflow_state.get("summary", {}))
            )
            
            db.add(workflow_execution)
            
            # Store individual agent results
            for agent_name, result in workflow_state.get("results", {}).items():
                workflow_result = WorkflowResult(
                    workflow_id=workflow_state["workflow_id"],
                    agent_name=agent_name,
                    result_data=json.dumps(result),
                    execution_date=workflow_state["execution_date"]
                )
                db.add(workflow_result)
            
            db.commit()
            logger.info(f"Stored workflow results for {workflow_state['workflow_id']}")
            
        except Exception as e:
            logger.error(f"Failed to store workflow results: {e}")
            db.rollback()
        finally:
            db.close()
    
    async def cancel_workflow(self, workflow_id: str):
        """
        Cancel a running workflow
        """
        if workflow_id in self.active_workflows:
            logger.info(f"Cancelling workflow {workflow_id}")
            del self.active_workflows[workflow_id]
            return True
        return False
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the current status of a workflow
        """
        return self.active_workflows.get(workflow_id)