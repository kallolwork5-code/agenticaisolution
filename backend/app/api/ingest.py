"""
Ingestion API.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import logging

from app.agents.ingestion_graph import build_ingestion_graph
from app.services.audit_service import log_agent_decision
from app.db.database import SessionLocal
from app.services.transaction_ingestion_service import ingest_transactions
from app.services.vector_ingestion_service import (
    ingest_rate_card,
    ingest_routing_logic,
)
from app.utils.file_parsers import (
    parse_csv,
    parse_excel,
    parse_json,
    parse_pdf,
    parse_word,
)

router = APIRouter()
graph = build_ingestion_graph()

logger = logging.getLogger("ingestion-api")
logging.basicConfig(level=logging.INFO)


@router.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    filename = file.filename.lower()
    logger.info(f"[INGEST] Received file: {file.filename}")

    # -----------------------------
    # 1. Parse file
    # -----------------------------
    if filename.endswith(".csv"):
        df = parse_csv(file.file)

    elif filename.endswith(".xlsx"):
        df = parse_excel(file.file)

    elif filename.endswith(".json"):
        content = parse_json(file.file)
        if isinstance(content, list):
            df = pd.DataFrame(content)
        elif isinstance(content, dict):
            df = pd.DataFrame([content])
        else:
            raise HTTPException(400, "Unsupported JSON structure")

    elif filename.endswith(".pdf"):
        parse_pdf(file.file)
        return {
            "file": file.filename,
            "status": "RECEIVED",
            "note": "PDF ingestion skipped (placeholder)"
        }

    elif filename.endswith(".docx"):
        parse_word(file.file)
        return {
            "file": file.filename,
            "status": "RECEIVED",
            "note": "Word ingestion skipped (placeholder)"
        }

    else:
        raise HTTPException(400, "Unsupported file type")

    if df.empty:
        raise HTTPException(400, "Parsed file is empty")

    # -----------------------------
    # 2. Agent classification
    # -----------------------------
    state = {
        "file_name": file.filename,
        "columns": list(df.columns),
        "sample_rows": df.head(3).to_dict(orient="records"),
    }

    final_state = graph.invoke(state)
    log_agent_decision(final_state)

    # -----------------------------
    # 3. Ingestion
    # -----------------------------
    if final_state["data_type"] == "ACQUIRER_TRANSACTION":
        db = SessionLocal()
        try:
            ingest_transactions(df, db)
        finally:
            db.close()

    elif final_state["data_type"] == "RATE_CARD":
        ingest_rate_card(df)

    elif final_state["data_type"] == "ROUTING":
        ingest_routing_logic(df)

    else:
        logger.warning("Unknown data type. Nothing ingested.")

    return {
        "file": file.filename,
        "rows": len(df),
        "classification": final_state,
        "status": "INGESTED",
    }
