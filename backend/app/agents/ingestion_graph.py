import json
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from app.services.prompt_service import get_active_prompt
from app.db.database import SessionLocal

class IngestionState(TypedDict):
    file_name: str
    columns: List[str]
    sample_rows: List[dict]
    data_type: str
    confidence: float
    reasoning: str
    storage_type: str

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def rule_classifier(state: IngestionState):
    cols = set(c.lower() for c in state["columns"])
    if {"txn_id", "amount"} & cols:
        return {**state, "data_type": "ACQUIRER_TRANSACTION", "confidence": 0.9, "reasoning": "Transaction data"}
    return state

def llm_classifier(state: IngestionState):
    if state.get("confidence", 0) >= 0.7:
        return state
    db = SessionLocal()
    prompt = get_active_prompt(db, "ingestion")
    db.close()
    response = llm.invoke(prompt.prompt_text + str(state))
    parsed = json.loads(response.content)
    return {**state, **parsed}

def storage_decision(state: IngestionState):
    storage = "TRANSACTION_DB" if state["data_type"] == "ACQUIRER_TRANSACTION" else "VECTOR_DB"
    return {**state, "storage_type": storage}

def build_ingestion_graph():
    graph = StateGraph(IngestionState)
    graph.add_node("rule_classifier", rule_classifier)
    graph.add_node("llm_classifier", llm_classifier)
    graph.add_node("storage_decision", storage_decision)
    graph.set_entry_point("rule_classifier")
    graph.add_edge("rule_classifier", "llm_classifier")
    graph.add_edge("llm_classifier", "storage_decision")
    graph.add_edge("storage_decision", END)
    return graph.compile()
