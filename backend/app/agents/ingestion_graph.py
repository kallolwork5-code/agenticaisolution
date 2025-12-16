"""
Enhanced Ingestion Agent with LangGraph, WebSocket updates, and prompt-based classification.

Features:
- Real-time WebSocket progress updates
- Prompt-based LLM classification with safety checks
- Rule-based fast classification
- Comprehensive logging and observability
- Task, safety, and response handling
"""

import logging
import json
import asyncio
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from app.services.prompt_service import get_active_prompt
from app.db.database import SessionLocal
from datetime import datetime

# --------------------------------------------------
# Logger Configuration
# --------------------------------------------------

logger = logging.getLogger("ingestion-agent")
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
handler.setFormatter(formatter)

if not logger.handlers:
    logger.addHandler(handler)

# --------------------------------------------------
# Agent State Definition
# --------------------------------------------------

class IngestionState(TypedDict):
    file_id: str
    file_name: str
    columns: List[str]
    sample_rows: List[dict]
    
    # Classification results
    data_type: str
    confidence: float
    reasoning: str
    method: str  # "rule-based" or "llm"
    
    # Storage decision
    storage_type: str
    
    # WebSocket manager for real-time updates
    websocket_manager: Optional[object]


# --------------------------------------------------
# LLM (Fallback only)
# --------------------------------------------------

import os
try:
    if os.getenv("OPENAI_API_KEY"):
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0
        )
    else:
        llm = None
        logger.warning("OpenAI API key not found. LLM classification will be disabled.")
except Exception as e:
    llm = None
    logger.warning(f"Failed to initialize LLM: {e}")

# --------------------------------------------------
# Rule-based Classification with WebSocket Updates
# --------------------------------------------------

async def rule_based_classifier(state: IngestionState) -> IngestionState:
    logger.info(f"[START] Rule-based classification for file={state['file_name']}")
    
    # Send WebSocket update
    if state.get("websocket_manager"):
        await state["websocket_manager"].send_agent_update(
            state["file_id"],
            "Rule-Based Classifier",
            "processing",
            "Analyzing file structure and columns for pattern matching..."
        )

    cols = {c.lower() for c in state["columns"]}
    logger.info(f"[COLUMNS] Detected columns: {sorted(cols)}")

    # ---- TRANSACTION DATA RULE ----
    transaction_required = {
        "acquirer_name", "transaction_date", "settlement_date", 
        "transaction_amount", "mdr_percentage"
    }
    transaction_optional = {
        "transaction_currency", "card_type", "network_type", 
        "terminal_id", "merchant_id"
    }

    if transaction_required.issubset(cols):
        logger.info("[MATCH] Classified as TRANSACTION via rules")
        
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "Rule-Based Classifier", 
                "completed",
                "✅ Identified as Transaction Data - High confidence pattern match",
                {
                    "matched_columns": list(transaction_required),
                    "optional_columns": list(transaction_optional.intersection(cols)),
                    "confidence_factors": [
                        "Contains transaction and settlement dates",
                        "Has financial amounts and MDR data",
                        "Includes acquirer information"
                    ]
                }
            )
        
        return {
            **state,
            "data_type": "transaction",
            "confidence": 0.95,
            "method": "rule-based",
            "reasoning": "Strong pattern match: Contains transaction & settlement dates, amounts, MDR and acquirer details."
        }

    # ---- RATE CARD RULE ----
    rate_card_required = {
        "acquirer", "terminal_id", "payment_mode", 
        "card_classification", "network", "agreed_mdr_rate"
    }
    rate_card_optional = {
        "card_category", "applicable_sla_days", "sla_type",
        "effective_date", "expiry_date"
    }

    if rate_card_required.issubset(cols):
        logger.info("[MATCH] Classified as RATE_CARD via rules")
        
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "Rule-Based Classifier",
                "completed", 
                "✅ Identified as Rate Card Data - High confidence pattern match",
                {
                    "matched_columns": list(rate_card_required),
                    "optional_columns": list(rate_card_optional.intersection(cols)),
                    "confidence_factors": [
                        "Contains agreed MDR rates",
                        "Has SLA terms and card configuration",
                        "Includes terminal and acquirer mapping"
                    ]
                }
            )
        
        return {
            **state,
            "data_type": "reference",
            "confidence": 0.90,
            "method": "rule-based",
            "reasoning": "Strong pattern match: Contains agreed MDR rates, SLA terms and card configuration details."
        }

    # ---- ROUTING RULE ----
    routing_required = {
        "terminal_id", "payment_method", "card_classification",
        "network", "primary_acquirer"
    }
    routing_optional = {
        "secondary_acquirer", "tertiary_acquirer", "routing_priority",
        "effective_date", "expiry_date"
    }

    if routing_required.issubset(cols):
        logger.info("[MATCH] Classified as ROUTING via rules")
        
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "Rule-Based Classifier",
                "completed",
                "✅ Identified as Routing Rules - High confidence pattern match", 
                {
                    "matched_columns": list(routing_required),
                    "optional_columns": list(routing_optional.intersection(cols)),
                    "confidence_factors": [
                        "Contains routing rules with acquirer hierarchy",
                        "Has payment method and card classification",
                        "Includes terminal mapping"
                    ]
                }
            )
        
        return {
            **state,
            "data_type": "reference",
            "confidence": 0.90,
            "method": "rule-based", 
            "reasoning": "Strong pattern match: Contains routing rules with primary and secondary acquirers."
        }

    logger.warning("[NO MATCH] Rule-based classification failed. LLM fallback required.")
    
    if state.get("websocket_manager"):
        await state["websocket_manager"].send_agent_update(
            state["file_id"],
            "Rule-Based Classifier",
            "completed",
            "⚠️ No pattern match found - Escalating to AI classifier",
            {
                "analyzed_columns": sorted(cols),
                "missing_patterns": [
                    "Transaction data patterns",
                    "Rate card patterns", 
                    "Routing rule patterns"
                ]
            }
        )

    return {
        **state,
        "confidence": 0.0,
        "method": "rule-based",
        "reasoning": "Rule-based classification could not determine data type - requires AI analysis."
    }

# --------------------------------------------------
# LLM Fallback Classifier with Enhanced Prompts
# --------------------------------------------------

async def llm_fallback_classifier(state: IngestionState) -> IngestionState:
    if state["confidence"] >= 0.7:
        logger.info("[SKIP] LLM fallback not required")
        return state

    logger.warning("[LLM] Invoking AI-powered fallback classifier")
    
    # Send WebSocket update
    if state.get("websocket_manager"):
        await state["websocket_manager"].send_agent_update(
            state["file_id"],
            "AI Classifier",
            "processing",
            "🤖 Analyzing data with AI - Loading classification prompts..."
        )

    db = SessionLocal()
    try:
        # Load prompts with error handling
        try:
            system_prompt = get_active_prompt(db, "ingestion", "system")
            task_prompt = get_active_prompt(db, "ingestion", "task")
            safety_prompt = get_active_prompt(db, "ingestion", "safety")
            response_prompt = get_active_prompt(db, "ingestion", "response")
        except Exception as e:
            logger.error(f"Error loading prompts: {e}")
            # Fallback to default prompts
            system_prompt = type('obj', (object,), {'prompt_text': 'You are an expert data classification agent for financial transaction systems.'})()
            task_prompt = type('obj', (object,), {'prompt_text': 'Classify the provided data as transaction, reference, or document type.'})()
            safety_prompt = type('obj', (object,), {'prompt_text': 'Ensure data privacy and security in your analysis.'})()
            response_prompt = type('obj', (object,), {'prompt_text': 'Respond with JSON: {"data_type": "type", "confidence": 0.0-1.0, "reasoning": "explanation"}'})()
    finally:
        db.close()

    # Send WebSocket update about prompt loading
    if state.get("websocket_manager"):
        await state["websocket_manager"].send_agent_update(
            state["file_id"],
            "AI Classifier",
            "processing",
            "🧠 AI analysis in progress - Examining data patterns and structure..."
        )

    # Build comprehensive prompt
    full_prompt = f"""
{system_prompt.prompt_text}

{task_prompt.prompt_text}

{safety_prompt.prompt_text}

ANALYSIS CONTEXT:
File name: {state['file_name']}
Columns detected: {state['columns']}
Sample data rows: {state['sample_rows'][:3]}  # Limit sample for token efficiency
Previous analysis: {state.get('reasoning', 'No previous analysis')}

CLASSIFICATION REQUIREMENTS:
- transaction: Financial transaction records with amounts, dates, acquirer info
- reference: Configuration data like rate cards, routing rules, lookup tables  
- document: Unstructured content like PDFs, Word docs, reports

{response_prompt.prompt_text}
"""

    try:
        # Send WebSocket update about LLM invocation
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "AI Classifier",
                "processing",
                "🔍 AI model analyzing data structure and content patterns..."
            )
        
        response = llm.invoke(full_prompt)
        logger.info("[LLM RESPONSE] Raw response received")

        # Parse response with error handling
        try:
            parsed = json.loads(response.content)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing LLM response: {e}")
            # Fallback response
            parsed = {
                "data_type": "document",
                "confidence": 0.3,
                "reasoning": "AI classification failed - defaulting to document type"
            }

        logger.info(f"[LLM RESULT] data_type={parsed['data_type']} confidence={parsed['confidence']}")
        
        # Send successful WebSocket update
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "AI Classifier",
                "completed",
                f"🎯 AI Classification Complete: {parsed['data_type']} (confidence: {parsed['confidence']:.1%})",
                {
                    "classification": parsed['data_type'],
                    "confidence": parsed['confidence'],
                    "reasoning": parsed['reasoning'],
                    "method": "llm",
                    "model_used": "gpt-4o-mini"
                }
            )

        return {
            **state,
            "data_type": parsed["data_type"],
            "confidence": parsed["confidence"],
            "method": "llm",
            "reasoning": parsed["reasoning"]
        }
        
    except Exception as e:
        logger.error(f"LLM classification error: {e}")
        
        # Send error WebSocket update
        if state.get("websocket_manager"):
            await state["websocket_manager"].send_agent_update(
                state["file_id"],
                "AI Classifier",
                "error",
                f"❌ AI classification failed: {str(e)}",
                {"error": str(e)}
            )
        
        # Return fallback classification
        return {
            **state,
            "data_type": "document",
            "confidence": 0.2,
            "method": "llm",
            "reasoning": f"AI classification failed due to error: {str(e)}"
        }

# --------------------------------------------------
# Storage Decision with WebSocket Updates
# --------------------------------------------------

async def storage_decision(state: IngestionState) -> IngestionState:
    # Determine storage type based on classification
    if state["data_type"] in ["transaction"]:
        storage = "SQL_DATABASE"
        storage_description = "Structured SQL database for transaction records"
    elif state["data_type"] in ["reference"]:
        storage = "SQL_DATABASE" 
        storage_description = "Structured SQL database for reference data (rate cards, routing rules)"
    else:  # document
        storage = "VECTOR_DATABASE"
        storage_description = "Vector database for document embeddings and RAG"

    logger.info(f"[STORAGE] Data type {state['data_type']} → {storage}")
    
    # Send WebSocket update
    if state.get("websocket_manager"):
        await state["websocket_manager"].send_agent_update(
            state["file_id"],
            "Storage Decision Agent",
            "completed",
            f"📊 Storage Decision: {storage}",
            {
                "data_type": state["data_type"],
                "storage_type": storage,
                "storage_description": storage_description,
                "classification_method": state.get("method", "unknown"),
                "confidence": state.get("confidence", 0.0)
            }
        )

    return {
        **state,
        "storage_type": storage
    }

# --------------------------------------------------
# Build LangGraph
# --------------------------------------------------

def build_ingestion_graph():
    logger.info("[INIT] Building ingestion agent graph")

    graph = StateGraph(IngestionState)

    graph.add_node("rule_classifier", rule_based_classifier)
    graph.add_node("llm_classifier", llm_fallback_classifier)
    graph.add_node("storage_decision", storage_decision)

    graph.set_entry_point("rule_classifier")
    graph.add_edge("rule_classifier", "llm_classifier")
    graph.add_edge("llm_classifier", "storage_decision")
    graph.add_edge("storage_decision", END)

    logger.info("[INIT] Ingestion agent graph compiled")

    return graph.compile()

# --------------------------------------------------
# Enhanced Ingestion Orchestrator
# --------------------------------------------------

class IngestionOrchestrator:
    """
    Orchestrates the complete ingestion process with WebSocket updates
    """
    
    def __init__(self, websocket_manager=None):
        self.websocket_manager = websocket_manager
        self.graph = build_ingestion_graph()
    
    async def process_file(self, file_id: str, file_name: str, columns: List[str], sample_rows: List[dict]) -> dict:
        """
        Process a file through the complete ingestion pipeline
        """
        logger.info(f"[ORCHESTRATOR] Starting ingestion for file {file_id}")
        
        # Initialize state
        initial_state = IngestionState(
            file_id=file_id,
            file_name=file_name,
            columns=columns,
            sample_rows=sample_rows,
            data_type="",
            confidence=0.0,
            reasoning="",
            method="",
            storage_type="",
            websocket_manager=self.websocket_manager
        )
        
        try:
            # Send initial WebSocket update
            if self.websocket_manager:
                await self.websocket_manager.send_agent_update(
                    file_id,
                    "Ingestion Orchestrator",
                    "processing",
                    "🚀 Starting intelligent data classification pipeline..."
                )
            
            # Execute the graph
            final_state = await self.graph.ainvoke(initial_state)
            
            # Send completion update
            if self.websocket_manager:
                await self.websocket_manager.send_classification_update(file_id, {
                    "data_type": final_state["data_type"],
                    "confidence": final_state["confidence"],
                    "reasoning": final_state["reasoning"],
                    "method": final_state["method"],
                    "storage_type": final_state["storage_type"]
                })
            
            logger.info(f"[ORCHESTRATOR] Completed ingestion for file {file_id}")
            
            return {
                "status": "success",
                "data_type": final_state["data_type"],
                "confidence": final_state["confidence"],
                "reasoning": final_state["reasoning"],
                "method": final_state["method"],
                "storage_type": final_state["storage_type"]
            }
            
        except Exception as e:
            logger.error(f"[ORCHESTRATOR] Error processing file {file_id}: {e}")
            
            if self.websocket_manager:
                await self.websocket_manager.send_agent_update(
                    file_id,
                    "Ingestion Orchestrator",
                    "error",
                    f"❌ Pipeline failed: {str(e)}"
                )
            
            return {
                "status": "error",
                "error": str(e),
                "data_type": "unknown",
                "confidence": 0.0
            }