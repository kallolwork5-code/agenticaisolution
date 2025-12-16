from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, DECIMAL
from datetime import datetime
import uuid
from ..db.models import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Transaction details
    transaction_date = Column(DateTime, nullable=False)
    settlement_date = Column(DateTime, nullable=False)
    acquirer_name = Column(String(100), nullable=False)
    card_type = Column(String(50), nullable=False)
    network_type = Column(String(50), nullable=False)
    
    # Financial data
    transaction_amount = Column(DECIMAL(15, 2), nullable=False)
    mdr_percentage = Column(DECIMAL(5, 4), nullable=False)  # e.g., 2.5000 for 2.5%
    mdr_cost = Column(DECIMAL(15, 2), nullable=False)
    gross_settlement_cost = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='USD')
    
    # Terminal and reference data
    terminal_id = Column(String(50), nullable=False)
    merchant_id = Column(String(50), nullable=True)
    transaction_reference = Column(String(100), nullable=True)
    
    # Processing metadata
    file_id = Column(String, nullable=True)  # Reference to uploaded file
    batch_id = Column(String, nullable=True)  # For batch processing
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Status and validation
    status = Column(String(20), default='pending', nullable=False)  # pending, validated, reconciled, error
    validation_errors = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, terminal_id={self.terminal_id}, amount={self.transaction_amount})>"