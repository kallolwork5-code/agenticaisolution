from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..db.models import Base

class ReconciliationResult(Base):
    __tablename__ = "reconciliation_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Reference to the transaction being reconciled
    transaction_id = Column(String, nullable=False, index=True)
    
    # Overall reconciliation status
    overall_status = Column(String(20), nullable=False)  # valid, invalid, warning, error
    reconciliation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Cost validation results
    cost_validation_status = Column(String(20), nullable=False)  # valid, invalid, warning
    expected_mdr_rate = Column(DECIMAL(5, 4), nullable=True)
    actual_mdr_rate = Column(DECIMAL(5, 4), nullable=True)
    expected_mdr_cost = Column(DECIMAL(15, 2), nullable=True)
    actual_mdr_cost = Column(DECIMAL(15, 2), nullable=True)
    cost_variance = Column(DECIMAL(15, 2), nullable=True)
    cost_variance_percentage = Column(DECIMAL(5, 2), nullable=True)
    
    # SLA validation results
    sla_validation_status = Column(String(20), nullable=False)  # valid, invalid, warning
    expected_settlement_date = Column(DateTime, nullable=True)
    actual_settlement_date = Column(DateTime, nullable=True)
    sla_met = Column(Boolean, nullable=True)
    delay_days = Column(Integer, nullable=True)
    sla_type_expected = Column(String(10), nullable=True)  # T+1, T+2, etc.
    
    # Routing validation results
    routing_validation_status = Column(String(20), nullable=False)  # valid, invalid, warning
    expected_acquirer = Column(String(100), nullable=True)
    actual_acquirer = Column(String(100), nullable=True)
    is_optimal_routing = Column(Boolean, nullable=True)
    routing_cost_impact = Column(DECIMAL(15, 2), nullable=True)
    routing_reason = Column(String(200), nullable=True)  # Why this routing was chosen
    
    # Rate card matching
    rate_card_id = Column(String, nullable=True)  # Reference to matched rate card
    rate_card_match_confidence = Column(DECIMAL(3, 2), nullable=True)  # 0.00 to 1.00
    
    # Routing rule matching
    routing_rule_id = Column(String, nullable=True)  # Reference to matched routing rule
    routing_rule_match_confidence = Column(DECIMAL(3, 2), nullable=True)  # 0.00 to 1.00
    
    # Processing metadata
    reconciliation_batch_id = Column(String, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(String(50), nullable=True)
    
    # Additional details and notes
    validation_notes = Column(Text, nullable=True)
    error_details = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ReconciliationResult(id={self.id}, transaction_id={self.transaction_id}, status={self.overall_status})>"
    
    def get_discrepancies(self) -> list:
        """Get list of discrepancies found during reconciliation"""
        discrepancies = []
        
        if self.cost_validation_status == 'invalid':
            discrepancies.append({
                'type': 'cost_validation',
                'description': f'Cost variance of {self.cost_variance} ({self.cost_variance_percentage}%)',
                'expected': self.expected_mdr_cost,
                'actual': self.actual_mdr_cost
            })
        
        if self.sla_validation_status == 'invalid':
            discrepancies.append({
                'type': 'sla_validation',
                'description': f'SLA violation: {self.delay_days} days delay',
                'expected': self.expected_settlement_date,
                'actual': self.actual_settlement_date
            })
        
        if self.routing_validation_status == 'invalid':
            discrepancies.append({
                'type': 'routing_validation',
                'description': f'Suboptimal routing: used {self.actual_acquirer} instead of {self.expected_acquirer}',
                'cost_impact': self.routing_cost_impact
            })
        
        return discrepancies
    
    def is_valid(self) -> bool:
        """Check if reconciliation passed all validations"""
        return (self.cost_validation_status == 'valid' and 
                self.sla_validation_status == 'valid' and 
                self.routing_validation_status == 'valid')


class Discrepancy(Base):
    __tablename__ = "discrepancies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Reference to reconciliation result
    reconciliation_result_id = Column(String, nullable=False, index=True)
    
    # Discrepancy details
    discrepancy_type = Column(String(50), nullable=False)  # cost, sla, routing, data_quality
    severity = Column(String(20), nullable=False)  # critical, high, medium, low
    description = Column(Text, nullable=False)
    
    # Expected vs actual values
    expected_value = Column(String(200), nullable=True)
    actual_value = Column(String(200), nullable=True)
    variance = Column(DECIMAL(15, 2), nullable=True)
    variance_percentage = Column(DECIMAL(5, 2), nullable=True)
    
    # Financial impact
    financial_impact = Column(DECIMAL(15, 2), nullable=True)
    currency = Column(String(3), nullable=True, default='USD')
    
    # Resolution tracking
    status = Column(String(20), default='open', nullable=False)  # open, investigating, resolved, closed
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(50), nullable=True)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Discrepancy(id={self.id}, type={self.discrepancy_type}, severity={self.severity})>"