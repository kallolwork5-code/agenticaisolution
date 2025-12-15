from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.db.database import Base

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(Integer, primary_key=True, index=True)
    agent_role = Column(String, index=True)
    prompt_type = Column(String, default="system")
    prompt_text = Column(Text, nullable=False)
    version = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
