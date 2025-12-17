#!/usr/bin/env python3
"""
AI Workflows API

REST API endpoints for managing and executing AI agent workflows
"""

import logging
import asyncio
from datetime import datetime, date
from typing import Dict, Any, List, Optional
import uuid
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ..agents.workflow_orchestrator import WorkflowOrchestrator
from ..db.database import SessionLocal
from ..db.models import WorkflowExecution, WorkflowResult

logger = logging.getLogger("ai-workflows-api")

# Initialize router
router = APIRouter(prefix="/api/ai-workflows", tags=["AI Workflows"])

# Initialize orchestrator
orchestrator = WorkflowOrchestrator()

# WebSocket connection manager
class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, workflow_id: str):
        await websocket.accept()
        self.active_connections[workflow_id] = websocket
        logger.info(f"WebSocket connected for workflow {workflow_id}")
    
    def disconnect(self, workflow_id: str):
        if workflow_id in self.active_connections:
            del self.active_connections[workflow_id]
            logger.info(f"WebSocket disconnected for workflow {workflow_id}")
    
    async def send_update(self, workflow_id: str, data: Dict[str, Any]):
        if workflow_id in self.active_connections:
            try:
                await self.active_connections[workflow_id].send_text(json.dumps(data))
            except Exception as e:
                logger.error(f"Failed to send WebSocket update: {e}")
                self.disconnect(workflow_id)

websocket_manager = WebSocketManager()

# Pydantic models
class WorkflowExecutionRequest(BaseModel):
    execution_date: str = Field(..., description="Date to execute workflow for (YYYY-MM-DD)")
    workflow_template: str = Field(..., description="Workflow template to execute")
    agents: List[str] = Field(..., description="List of agents to execute")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Additional parameters")

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    status: str
    execution_date: str
    started_at: Optional[str]
    completed_at: Optional[str]
    overall_progress: int
    agents_executed: List[str]
    current_agent: Optional[str]

# Available agents configuration
AVAILABLE_AGENTS = {
    "sla_calculator": {
        "id": "sla_calculator",
        "name": "SLA Calculator Agent",
        "description": "Calculates SLA metrics from existing transaction data and monitors compliance performance",
        "category": "Performance",
        "inputs": ["transaction_data", "settlement_data", "response_times"],
        "outputs": ["sla_compliance", "performance_metrics", "breach_analysis"],
        "estimated_duration": "2-3 minutes",
        "icon": "clock"
    },
    "routing_optimizer": {
        "id": "routing_optimizer", 
        "name": "Routing Optimization Agent",
        "description": "Analyzes routing decisions between primary and secondary acquirers to identify cost savings opportunities",
        "category": "Routing",
        "inputs": ["transaction_data", "acquirer_rates", "routing_rules"],
        "outputs": ["routing_analysis", "cost_savings", "optimization_recommendations"],
        "estimated_duration": "3-4 minutes",
        "icon": "route"
    },
    "settlement_analyzer": {
        "id": "settlement_analyzer",
        "name": "Settlement Analysis Agent", 
        "description": "Analyzes settlement efficiency and MDR optimization to ensure correct settlements with optimal rates",
        "category": "Settlement",
        "inputs": ["settlement_data", "mdr_rates", "acquirer_performance"],
        "outputs": ["settlement_analysis", "mdr_optimization", "efficiency_metrics"],
        "estimated_duration": "2-3 minutes",
        "icon": "banknote"
    }
}

# Workflow templates
WORKFLOW_TEMPLATES = {
    "comprehensive_analysis": {
        "id": "comprehensive_analysis",
        "name": "Comprehensive Payment Analysis",
        "description": "Complete analysis including SLA monitoring, routing optimization, and settlement efficiency",
        "agents": ["sla_calculator", "routing_optimizer", "settlement_analyzer"],
        "estimated_duration": "7-10 minutes",
        "frequency": "daily"
    },
    "routing_optimization": {
        "id": "routing_optimization", 
        "name": "Routing & Cost Optimization",
        "description": "Focus on routing decisions and cost savings between primary and secondary acquirers",
        "agents": ["routing_optimizer", "settlement_analyzer"],
        "estimated_duration": "5-7 minutes",
        "frequency": "daily"
    },
    "sla_monitoring": {
        "id": "sla_monitoring",
        "name": "SLA Performance Monitoring", 
        "description": "Monitor SLA compliance and settlement performance metrics",
        "agents": ["sla_calculator", "settlement_analyzer"],
        "estimated_duration": "4-6 minutes",
        "frequency": "daily"
    },
    "quick_health_check": {
        "id": "quick_health_check",
        "name": "Quick System Health Check",
        "description": "Fast SLA check to ensure system is performing within acceptable parameters",
        "agents": ["sla_calculator"],
        "estimated_duration": "2-3 minutes", 
        "frequency": "hourly"
    }
}

@router.get("/available-agents")
async def get_available_agents():
    """Get list of available AI agents"""
    try:
        return JSONResponse({
            "status": "success",
            "agents": list(AVAILABLE_AGENTS.values())
        })
    except Exception as e:
        logger.error(f"Failed to get available agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflow-templates")
async def get_workflow_templates():
    """Get list of available workflow templates"""
    try:
        return JSONResponse({
            "status": "success", 
            "templates": list(WORKFLOW_TEMPLATES.values())
        })
    except Exception as e:
        logger.error(f"Failed to get workflow templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute")
async def execute_workflow(request: WorkflowExecutionRequest, background_tasks: BackgroundTasks):
    """Execute a workflow with specified agents"""
    try:
        # Generate unique workflow ID
        workflow_id = str(uuid.uuid4())
        
        # Parse execution date
        execution_date = datetime.strptime(request.execution_date, "%Y-%m-%d").date()
        
        # Validate agents
        invalid_agents = [agent for agent in request.agents if agent not in AVAILABLE_AGENTS]
        if invalid_agents:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid agents: {invalid_agents}"
            )
        
        # Start workflow execution in background
        background_tasks.add_task(
            execute_workflow_background,
            workflow_id,
            execution_date,
            request.agents,
            request.parameters
        )
        
        logger.info(f"Started workflow {workflow_id} with agents: {request.agents}")
        
        return JSONResponse({
            "status": "success",
            "workflow_id": workflow_id,
            "message": "Workflow execution started",
            "agents": request.agents,
            "execution_date": request.execution_date,
            "estimated_duration": _calculate_estimated_duration(request.agents)
        })
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        logger.error(f"Failed to execute workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def execute_workflow_background(
    workflow_id: str,
    execution_date: date, 
    agents: List[str],
    parameters: Dict[str, Any]
):
    """Execute workflow in background task"""
    try:
        result = await orchestrator.execute_workflow(
            workflow_id=workflow_id,
            execution_date=execution_date,
            agents=agents,
            parameters=parameters,
            websocket_manager=websocket_manager
        )
        
        logger.info(f"Workflow {workflow_id} completed with status: {result.get('status')}")
        
    except Exception as e:
        logger.error(f"Background workflow execution failed: {e}")
        
        # Send error update via WebSocket
        await websocket_manager.send_update(workflow_id, {
            "type": "workflow_failed",
            "workflow_id": workflow_id,
            "error": str(e)
        })

@router.get("/status/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    """Get current status of a workflow execution"""
    try:
        # Check if workflow is currently running
        status = orchestrator.get_workflow_status(workflow_id)
        
        if status:
            return JSONResponse({
                "status": "success",
                "workflow": {
                    "workflow_id": workflow_id,
                    "status": status["status"],
                    "execution_date": status["execution_date"].isoformat(),
                    "started_at": status["started_at"].isoformat(),
                    "completed_at": status.get("completed_at").isoformat() if status.get("completed_at") else None,
                    "overall_progress": status["overall_progress"],
                    "agents_executed": status["agents"],
                    "current_agent": None  # Could be enhanced to track current agent
                }
            })
        
        # Check database for completed workflows
        db = SessionLocal()
        try:
            workflow = db.query(WorkflowExecution).filter(
                WorkflowExecution.workflow_id == workflow_id
            ).first()
            
            if not workflow:
                raise HTTPException(status_code=404, detail="Workflow not found")
            
            return JSONResponse({
                "status": "success",
                "workflow": {
                    "workflow_id": workflow_id,
                    "status": workflow.status,
                    "execution_date": workflow.execution_date.isoformat(),
                    "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
                    "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
                    "overall_progress": 100 if workflow.status == "completed" else 0,
                    "agents_executed": json.loads(workflow.agents_executed) if workflow.agents_executed else [],
                    "summary": json.loads(workflow.summary) if workflow.summary else None
                }
            })
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cancel/{workflow_id}")
async def cancel_workflow(workflow_id: str):
    """Cancel a running workflow"""
    try:
        success = await orchestrator.cancel_workflow(workflow_id)
        
        if success:
            # Send cancellation update via WebSocket
            await websocket_manager.send_update(workflow_id, {
                "type": "workflow_cancelled",
                "workflow_id": workflow_id,
                "message": "Workflow cancelled by user"
            })
            
            return JSONResponse({
                "status": "success",
                "message": "Workflow cancelled successfully"
            })
        else:
            raise HTTPException(status_code=404, detail="Workflow not found or not running")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executions")
async def get_workflow_executions(limit: int = 50, offset: int = 0):
    """Get list of workflow executions"""
    try:
        db = SessionLocal()
        try:
            executions = db.query(WorkflowExecution).order_by(
                WorkflowExecution.started_at.desc()
            ).offset(offset).limit(limit).all()
            
            execution_list = []
            for execution in executions:
                execution_data = {
                    "workflow_id": execution.workflow_id,
                    "name": execution.name,
                    "status": execution.status,
                    "execution_date": execution.execution_date.isoformat(),
                    "created_at": execution.created_at.isoformat() if execution.created_at else None,
                    "started_at": execution.started_at.isoformat() if execution.started_at else None,
                    "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                    "overall_progress": 100 if execution.status == "completed" else 0,
                    "agents_executed": json.loads(execution.agents_executed) if execution.agents_executed else [],
                    "summary": json.loads(execution.summary) if execution.summary else None
                }
                execution_list.append(execution_data)
            
            return JSONResponse({
                "status": "success",
                "executions": execution_list,
                "total": len(execution_list),
                "offset": offset,
                "limit": limit
            })
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to get workflow executions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{workflow_id}")
async def get_workflow_results(workflow_id: str):
    """Get detailed results for a completed workflow"""
    try:
        db = SessionLocal()
        try:
            # Get workflow execution
            execution = db.query(WorkflowExecution).filter(
                WorkflowExecution.workflow_id == workflow_id
            ).first()
            
            if not execution:
                raise HTTPException(status_code=404, detail="Workflow not found")
            
            # Get individual agent results
            results = db.query(WorkflowResult).filter(
                WorkflowResult.workflow_id == workflow_id
            ).all()
            
            agent_results = {}
            for result in results:
                agent_results[result.agent_name] = json.loads(result.result_data) if result.result_data else {}
            
            return JSONResponse({
                "status": "success",
                "workflow": {
                    "workflow_id": workflow_id,
                    "name": execution.name,
                    "status": execution.status,
                    "execution_date": execution.execution_date.isoformat(),
                    "started_at": execution.started_at.isoformat() if execution.started_at else None,
                    "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                    "summary": json.loads(execution.summary) if execution.summary else None
                },
                "agent_results": agent_results
            })
            
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{workflow_id}")
async def websocket_endpoint(websocket: WebSocket, workflow_id: str):
    """WebSocket endpoint for real-time workflow updates"""
    await websocket_manager.connect(websocket, workflow_id)
    
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "workflow_id": workflow_id,
            "message": "WebSocket connection established"
        }))
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client (like ping/pong)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        websocket_manager.disconnect(workflow_id)

def _calculate_estimated_duration(agents: List[str]) -> str:
    """Calculate estimated duration for workflow based on agents"""
    total_minutes = 0
    
    for agent_id in agents:
        agent_info = AVAILABLE_AGENTS.get(agent_id, {})
        duration_str = agent_info.get("estimated_duration", "3-4 minutes")
        
        # Parse duration (e.g., "3-4 minutes" -> average of 3.5)
        try:
            if "-" in duration_str:
                min_dur, max_dur = duration_str.split("-")
                min_val = float(min_dur.strip())
                max_val = float(max_dur.split()[0].strip())
                avg_duration = (min_val + max_val) / 2
            else:
                avg_duration = float(duration_str.split()[0])
            
            total_minutes += avg_duration
            
        except (ValueError, IndexError):
            total_minutes += 3  # Default 3 minutes
    
    return f"{int(total_minutes)}-{int(total_minutes + 2)} minutes"