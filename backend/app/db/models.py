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


class AgentResult(Base):
    __tablename__ = "agent_results"
    
    id = Column(Integer, primary_key=True)
    agent_name = Column(String, nullable=False)
    execution_date = Column(Date, nullable=False)
    workflow_id = Column(String, nullable=True)
    
    # Key metrics for dashboard
    status = Column(String, nullable=False)
    execution_time_seconds = Column(Float, nullable=True)
    records_processed = Column(Integer, nullable=True)
    insights_generated = Column(Integer, nullable=True)
    
    # Full result data
    result_data = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


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


class Upload(Base):
    """
    Database model for file uploads with AI classification and insights
    """
    __tablename__ = "uploads"

    id = Column(String, primary_key=True)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # AI Classification results
    classification = Column(String, nullable=False)
    storage_location = Column(String, nullable=False)  # 'sqlite' or 'chromadb'
    confidence = Column(Float, nullable=False)
    method = Column(String, nullable=False)  # 'ai_prompt', 'rule_based', 'fallback'
    reasoning = Column(Text)
    
    # File metadata
    record_count = Column(Integer)
    status = Column(String, nullable=False)  # 'success', 'processing', 'failed'
    
    # AI-generated content
    ai_summary = Column(Text)
    ai_insights = Column(Text)  # JSON string of insights array
    
    # Processing metadata
    processing_time = Column(Float)  # seconds
    prompt_used = Column(String)  # which prompt was used for classification


class WorkflowExecution(Base):
    """
    Database model for AI workflow executions
    """
    __tablename__ = "workflow_executions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'pending', 'running', 'completed', 'failed', 'cancelled'
    execution_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    agents_executed = Column(Text)  # JSON string of agent names
    parameters = Column(Text)  # JSON string of parameters
    summary = Column(Text)  # JSON string of execution summary
    error_message = Column(Text)


class WorkflowResult(Base):
    """
    Database model for individual agent results within workflows
    """
    __tablename__ = "workflow_results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    workflow_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    execution_date = Column(Date, nullable=False)
    result_data = Column(Text)  # JSON string of agent results
    created_at = Column(DateTime, default=datetime.utcnow)
