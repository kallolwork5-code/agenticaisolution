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
# from app.api.file_upload import router as file_upload_router
from app.api.simple_upload import router as simple_upload_router
from app.api.ai_workflows import router as ai_workflows_router
from app.api.schema_management import router as schema_router
from app.api.websocket import router as websocket_router
from app.api.insights import router as insights_router
from app.api.upload import router as upload_router
from app.api.classification import router as classification_router
from app.api.chatbot import router as chatbot_router
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
# app.include_router(file_upload_router)
app.include_router(simple_upload_router)
app.include_router(ai_workflows_router)
app.include_router(schema_router)
app.include_router(websocket_router)
app.include_router(insights_router, prefix="/api")
app.include_router(upload_router, prefix="/api/upload")
app.include_router(classification_router, prefix="/api/classification")
app.include_router(chatbot_router, prefix="/api/chatbot")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def health():
    return {"status": "ok"}