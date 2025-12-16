"""
Database models for prompt repository.

Design decision:
- (agent_role, prompt_type) is treated as a logical primary key
- Only ONE active prompt exists per agent role and prompt type
- Versioning is explicit, not automatic
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, UniqueConstraint,Date,Float
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


"""
SQLAlchemy model for acquirer transaction data.

Purpose:
- Store immutable transaction records
- Used for reconciliation and audit
"""


class AcquirerTransaction(Base):
    __tablename__ = "acquirer_transactions"

    id = Column(Integer, primary_key=True, index=True)

    acquirer_name = Column(String, index=True)
    merchant_id = Column(String, index=True)

    transaction_date = Column(Date)
    settlement_date = Column(Date)

    card_number = Column(String)
    card_classification = Column(String)
    card_category = Column(String)
    card_network = Column(String)
    card_subtype = Column(String)

    terminal_id = Column(String, index=True)
    transaction_type = Column(String)

    transaction_amount = Column(Float)
    transaction_currency = Column(String)

    settlement_currency = Column(String)
    gross_settlement_amount = Column(Float)

    mdr_percentage = Column(Float)
    mdr_amount = Column(Float)
