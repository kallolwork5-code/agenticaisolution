"""
Backend entry point.

WHY:
- Initializes FastAPI
- Registers routes
- Creates DB tables
"""

from dotenv import load_dotenv
load_dotenv()   # 👈 THIS IS REQUIRED
from fastapi import FastAPI
from app.api.ingest import router as ingest_router
from app.api.prompts import router as prompt_router
from app.db.database import engine
from app.db import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentic AI Backend")

app.include_router(ingest_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def health():
    return {"status": "ok"}