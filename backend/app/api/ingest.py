from fastapi import APIRouter, UploadFile, File
import pandas as pd
from app.agents.ingestion_graph import build_ingestion_graph
from app.services.audit_service import log_agent_decision

router = APIRouter()
graph = build_ingestion_graph()

@router.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    state = {
        "file_name": file.filename,
        "columns": list(df.columns),
        "sample_rows": df.head(3).to_dict(orient="records")
    }
    final_state = graph.invoke(state)
    log_agent_decision(final_state)
    return final_state
