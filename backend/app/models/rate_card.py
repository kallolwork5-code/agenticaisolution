from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, DECIMAL
from datetime import datetime
from decimal import Decimal
import uuid
from ..db.models import Base

class RateCard(Base):
    __tablename__ = "rate_cards"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Acquirer and terminal information
    acquirer = Column(String(100), nullable=False)
    terminal_id = Column(String(50), nullable=False)
    merchant_id = Column(String(50), nullable=True)
    
    # Payment classification
    payment_mode = Column(String(50), nullable=False)  # credit, debit, prepaid
    card_classification = Column(String(50), nullable=False)  # consumer, commercial, premium
    network = Column(String(50), nullable=False)  # visa, mastercard, amex, etc.
    card_category = Column(String(50), nullable=True)  # additional categorization
    
    # Rate information
    agreed_mdr_rate = Column(DECIMAL(5, 4), nullable=False)  # e.g., 2.5000 for 2.5%
    fixed_fee = Column(DECIMAL(10, 2), nullable=True, default=0.00)  # Fixed transaction fee
    minimum_fee = Column(DECIMAL(10, 2), nullable=True, default=0.00)  # Minimum fee per transaction
    maximum_fee = Column(DECIMAL(10, 2), nullable=True)  # Maximum fee cap
    
    # SLA information
    applicable_sla_days = Column(Integer, nullable=False)  # Number of days for settlement
    sla_type = Column(String(10), nullable=False)  # T+1, T+2, T+3, etc.
    
    # Validity period
    effective_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    
    # Processing metadata
    file_id = Column(String, nullable=True)  # Reference to uploaded file
    batch_id = Column(String, nullable=True)  # For batch processing
    
    # Status and validation
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String(20), default='active', nullable=False)  # active, inactive, expired, pending
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(String(50), nullable=True)  # User who created the record
    
    # Additional metadata
    notes = Column(Text, nullable=True)
    version = Column(Integer, default=1, nullable=False)  # For versioning rate changes
    
    def __repr__(self):
        return f"<RateCard(id={self.id}, acquirer={self.acquirer}, terminal_id={self.terminal_id}, rate={self.agreed_mdr_rate})>"
    
    def is_valid_for_date(self, check_date: datetime) -> bool:
        """Check if rate card is valid for a given date"""
        if check_date < self.effective_date:
            return False
        if self.expiry_date and check_date > self.expiry_date:
            return False
        return self.is_active
    
    def calculate_mdr_cost(self, transaction_amount: Decimal) -> Decimal:
        """Calculate MDR cost based on rate and amount"""
        mdr_cost = transaction_amount * (self.agreed_mdr_rate / 100)
        
        # Apply minimum fee if specified
        if self.minimum_fee and mdr_cost < self.minimum_fee:
            mdr_cost = self.minimum_fee
            
        # Apply maximum fee cap if specified
        if self.maximum_fee and mdr_cost > self.maximum_fee:
            mdr_cost = self.maximum_fee
            
        # Add fixed fee if specified
        if self.fixed_fee:
            mdr_cost += self.fixed_fee
            
        return mdr_cost