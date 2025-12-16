from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean, Float
from datetime import datetime
import uuid
from ..db.models import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    # Classification results
    data_type = Column(String, nullable=True)  # 'reference', 'transaction', 'document'
    classification_confidence = Column(Float, nullable=True)
    
    # Schema information
    detected_schema = Column(JSON, nullable=True)
    table_name = Column(String, nullable=True)  # For structured data
    
    # Processing status
    status = Column(String, default='uploaded')  # uploaded, processing, completed, error
    processing_progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    processed_timestamp = Column(DateTime, nullable=True)
    processed_records = Column(Integer, nullable=True)
    
    # Duplicate handling
    content_hash = Column(String, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    original_file_id = Column(String, nullable=True)

class DataSchema(Base):
    __tablename__ = "data_schemas"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    schema_name = Column(String, nullable=False)
    data_type = Column(String, nullable=False)  # 'reference', 'transaction'
    schema_definition = Column(JSON, nullable=False)
    table_name = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    version = Column(Integer, default=1)
    
    # Usage tracking
    file_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)

class ProcessedDocument(Base):
    __tablename__ = "processed_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, nullable=False)
    chunk_id = Column(String, nullable=False)
    
    # Document content
    content = Column(Text, nullable=False)
    document_metadata = Column(JSON, nullable=True)
    
    # Vector storage reference
    vector_id = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class UploadHistory(Base):
    __tablename__ = "upload_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, nullable=False)
    
    # Event tracking
    event_type = Column(String, nullable=False)  # 'uploaded', 'processing_started', 'processing_completed', 'error', 'deleted'
    event_timestamp = Column(DateTime, default=datetime.utcnow)
    event_details = Column(JSON, nullable=True)
    
    # Processing metrics
    processing_duration = Column(Integer, nullable=True)  # in seconds
    records_processed = Column(Integer, nullable=True)
    bytes_processed = Column(Integer, nullable=True)
    
    # User context (for future multi-user support)
    user_id = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    
    # Additional metadata
    event_metadata = Column(JSON, nullable=True)