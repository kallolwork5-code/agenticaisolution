from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean
from datetime import datetime
import uuid
from ..db.models import Base

class FileSummary(Base):
    __tablename__ = "file_summaries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, nullable=False, unique=True)  # Reference to uploaded file
    
    # Summary content
    summary_text = Column(Text, nullable=False)
    key_insights = Column(JSON, nullable=True)  # List of key insights
    data_quality_score = Column(String, nullable=True)  # e.g., "High", "Medium", "Low"
    
    # Metadata
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    generated_by = Column(String, default='llm', nullable=False)  # 'llm' or 'user'
    model_used = Column(String, nullable=True)  # Which LLM model was used
    
    # Status
    is_approved = Column(Boolean, default=False, nullable=False)
    needs_review = Column(Boolean, default=False, nullable=False)
    
    def __repr__(self):
        return f"<FileSummary(id={self.id}, file_id={self.file_id})>"