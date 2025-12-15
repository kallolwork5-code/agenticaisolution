"""
Database models for prompt repository.

Design decision:
- (agent_role, prompt_type) is treated as a logical primary key
- Only ONE active prompt exists per agent role and prompt type
- Versioning is explicit, not automatic
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, UniqueConstraint
from datetime import datetime
from app.db.database import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True)
    agent_role = Column(String, nullable=False)
    prompt_type = Column(String, nullable=False)
    prompt_text = Column(Text, nullable=False)

    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "agent_role",
            "prompt_type",
            name="uq_agent_role_prompt_type"
        ),
    )
