from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, DECIMAL
from datetime import datetime
import uuid
from ..db.models import Base

class RoutingRule(Base):
    __tablename__ = "routing_rules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Terminal and merchant information
    terminal_id = Column(String(50), nullable=False)
    merchant_id = Column(String(50), nullable=True)
    
    # Payment classification for routing
    payment_method = Column(String(50), nullable=False)  # credit, debit, prepaid
    card_classification = Column(String(50), nullable=False)  # consumer, commercial, premium
    network = Column(String(50), nullable=False)  # visa, mastercard, amex, etc.
    
    # Transaction amount ranges (optional filters)
    min_amount = Column(DECIMAL(15, 2), nullable=True)
    max_amount = Column(DECIMAL(15, 2), nullable=True)
    
    # Acquirer routing configuration
    primary_acquirer = Column(String(100), nullable=False)
    secondary_acquirer = Column(String(100), nullable=True)
    tertiary_acquirer = Column(String(100), nullable=True)  # Additional fallback
    
    # Routing logic and priority
    routing_priority = Column(Integer, nullable=False, default=1)  # Lower number = higher priority
    routing_weight = Column(Integer, nullable=True, default=100)  # For load balancing (percentage)
    
    # Conditions and rules
    time_based_routing = Column(Boolean, default=False, nullable=False)  # Enable time-based routing
    start_time = Column(String(5), nullable=True)  # HH:MM format for daily routing
    end_time = Column(String(5), nullable=True)  # HH:MM format for daily routing
    
    # Geographic routing (optional)
    country_code = Column(String(3), nullable=True)
    region = Column(String(50), nullable=True)
    
    # Status and validity
    is_active = Column(Boolean, default=True, nullable=False)
    effective_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    
    # Processing metadata
    file_id = Column(String, nullable=True)  # Reference to uploaded file
    batch_id = Column(String, nullable=True)  # For batch processing
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(String(50), nullable=True)
    
    # Additional configuration
    notes = Column(Text, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    
    # Performance tracking
    success_rate = Column(DECIMAL(5, 2), nullable=True)  # Success rate percentage
    average_response_time = Column(Integer, nullable=True)  # Average response time in ms
    last_used = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    
    def __repr__(self):
        return f"<RoutingRule(id={self.id}, terminal_id={self.terminal_id}, primary_acquirer={self.primary_acquirer})>"
    
    def is_valid_for_date(self, check_date: datetime) -> bool:
        """Check if routing rule is valid for a given date"""
        if check_date < self.effective_date:
            return False
        if self.expiry_date and check_date > self.expiry_date:
            return False
        return self.is_active
    
    def matches_transaction(self, transaction_data: dict) -> bool:
        """Check if this routing rule matches a transaction"""
        # Check payment method
        if self.payment_method != transaction_data.get('payment_method'):
            return False
            
        # Check card classification
        if self.card_classification != transaction_data.get('card_classification'):
            return False
            
        # Check network
        if self.network != transaction_data.get('network'):
            return False
            
        # Check amount range if specified
        amount = transaction_data.get('amount', 0)
        if self.min_amount and amount < self.min_amount:
            return False
        if self.max_amount and amount > self.max_amount:
            return False
            
        # Check time-based routing if enabled
        if self.time_based_routing and self.start_time and self.end_time:
            current_time = datetime.now().strftime('%H:%M')
            if not (self.start_time <= current_time <= self.end_time):
                return False
                
        return True
    
    def get_preferred_acquirer(self, exclude_acquirers: list = None) -> str:
        """Get the preferred acquirer, excluding any in the exclude list"""
        exclude_acquirers = exclude_acquirers or []
        
        if self.primary_acquirer not in exclude_acquirers:
            return self.primary_acquirer
        elif self.secondary_acquirer and self.secondary_acquirer not in exclude_acquirers:
            return self.secondary_acquirer
        elif self.tertiary_acquirer and self.tertiary_acquirer not in exclude_acquirers:
            return self.tertiary_acquirer
        else:
            return None  # No available acquirer