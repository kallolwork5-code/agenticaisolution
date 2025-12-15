"""
Ingestion Agent implemented using LangGraph with FULL observability.

Logs:
- Every major decision
- Rule vs LLM path
- Final classification & storage decision
"""

import logging
import json
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from app.services.prompt_service import get_active_prompt
from app.db.database import SessionLocal

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
    file_name: str
    columns: List[str]
    sample_rows: List[dict]

    data_type: str
    confidence: float
    reasoning: str
    storage_type: str


# --------------------------------------------------
# LLM (Fallback only)
# --------------------------------------------------

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

# --------------------------------------------------
# Rule-based Classification
# --------------------------------------------------

def rule_based_classifier(state: IngestionState) -> IngestionState:
    logger.info(f"[START] Rule-based classification for file={state['file_name']}")

    cols = {c.lower() for c in state["columns"]}
    logger.info(f"[COLUMNS] Detected columns: {sorted(cols)}")

    # ---- ACQUIRER TRANSACTION RULE ----
    transaction_required = {
        "acquirer_name",
        "transaction_date",
        "settlement_date",
        "transaction_amount",
        "transaction_currency",
        "mdr_percentage"
    }

    if transaction_required.issubset(cols):
        logger.info("[MATCH] Classified as ACQUIRER_TRANSACTION via rules")
        return {
            **state,
            "data_type": "ACQUIRER_TRANSACTION",
            "confidence": 0.95,
            "reasoning": "Contains transaction & settlement dates, amounts, MDR and acquirer details."
        }

    # ---- RATE CARD RULE ----
    rate_card_required = {
        "acquirer",
        "terminal_id",
        "payment_mode",
        "card_classification",
        "network",
        "card_category",
        "agreed_mdr_rate",
        "applicable_sla_days"
    }

    if rate_card_required.issubset(cols):
        logger.info("[MATCH] Classified as RATE_CARD via rules")
        return {
            **state,
            "data_type": "RATE_CARD",
            "confidence": 0.90,
            "reasoning": "Contains agreed MDR rates, SLA terms and card configuration details."
        }

    # ---- ROUTING LOGIC RULE ----
    routing_required = {
        "terminal_id",
        "payment_method",
        "card_classification",
        "network",
        "primary_acquirer",
        "secondary_acquirer"
    }

    if routing_required.issubset(cols):
        logger.info("[MATCH] Classified as ROUTING via rules")
        return {
            **state,
            "data_type": "ROUTING",
            "confidence": 0.90,
            "reasoning": "Contains routing rules with primary and secondary acquirers."
        }

    logger.warning("[NO MATCH] Rule-based classification failed. LLM fallback required.")

    return {
        **state,
        "confidence": 0.0,
        "reasoning": "Rule-based classification could not determine data type."
    }

# --------------------------------------------------
# LLM Fallback Classifier
# --------------------------------------------------

def llm_fallback_classifier(state: IngestionState) -> IngestionState:
    if state["confidence"] >= 0.7:
        logger.info("[SKIP] LLM fallback not required")
        return state

    logger.warning("[LLM] Invoking LLM fallback classifier")

    db = SessionLocal()
    try:
        system_prompt = get_active_prompt(db, "ingestion", "system")
        task_prompt = get_active_prompt(db, "ingestion", "task")
        safety_prompt = get_active_prompt(db, "ingestion", "safety")
        schema_prompt = get_active_prompt(db, "ingestion", "output_schema")
    finally:
        db.close()

    full_prompt = f"""
{system_prompt.prompt_text}

{task_prompt.prompt_text}

{safety_prompt.prompt_text}

Context:
File name: {state['file_name']}
Columns: {state['columns']}
Sample rows: {state['sample_rows']}

{schema_prompt.prompt_text}
"""

    response = llm.invoke(full_prompt)

    logger.info("[LLM RESPONSE] Raw response received")

    parsed = json.loads(response.content)

    logger.info(
        f"[LLM RESULT] data_type={parsed['data_type']} "
        f"confidence={parsed['confidence']}"
    )

    return {
        **state,
        "data_type": parsed["data_type"],
        "confidence": parsed["confidence"],
        "reasoning": parsed["reasoning"]
    }

# --------------------------------------------------
# Storage Decision
# --------------------------------------------------

def storage_decision(state: IngestionState) -> IngestionState:
    if state["data_type"] == "ACQUIRER_TRANSACTION":
        storage = "TRANSACTION_DB"
    else:
        storage = "VECTOR_DB"

    logger.info(
        f"[STORAGE] Data type {state['data_type']} → {storage}"
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
