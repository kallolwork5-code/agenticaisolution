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
from fastapi.middleware.cors import CORSMiddleware
from app.api.ingest import router as ingest_router
from app.api.prompts import router as prompt_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.file_upload import router as file_upload_router
from app.api.enhanced_file_upload import router as enhanced_file_upload_router
from app.api.ai_engine import router as ai_engine_router
from app.api.schema_management import router as schema_router
from app.api.websocket import router as websocket_router
from app.db.database import engine
from app.db import models
from app.models.user import User
from app.models.file_upload import UploadedFile, DataSchema, ProcessedDocument, UploadHistory
from app.models.file_summary import FileSummary

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CollectiSense AI Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(users_router)
app.include_router(ingest_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")
app.include_router(file_upload_router)
app.include_router(enhanced_file_upload_router)
app.include_router(ai_engine_router)
app.include_router(schema_router)
app.include_router(websocket_router)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def health():
    return {"status": "ok"}