"""
Pydantic schemas for Reconciliation models.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class DiscrepancyBase(BaseModel):
    """Base schema for discrepancy data"""
    discrepancy_type: str = Field(..., max_length=50)
    severity: str = Field(..., regex='^(critical|high|medium|low)$')
    description: str
    expected_value: Optional[str] = Field(None, max_length=200)
    actual_value: Optional[str] = Field(None, max_length=200)
    variance: Optional[Decimal] = Field(None, decimal_places=2)
    variance_percentage: Optional[Decimal] = Field(None, decimal_places=2)
    financial_impact: Optional[Decimal] = Field(None, decimal_places=2)
    currency: Optional[str] = Field(default='USD', max_length=3)


class DiscrepancyCreate(DiscrepancyBase):
    """Schema for creating a new discrepancy"""
    reconciliation_result_id: str


class DiscrepancyUpdate(BaseModel):
    """Schema for updating discrepancy data"""
    status: Optional[str] = Field(None, regex='^(open|investigating|resolved|closed)$')
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = Field(None, max_length=50)


class DiscrepancyResponse(DiscrepancyBase):
    """Schema for discrepancy API responses"""
    id: str
    reconciliation_result_id: str
    status: str
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReconciliationResultBase(BaseModel):
    """Base schema for reconciliation result data"""
    transaction_id: str
    overall_status: str = Field(..., regex='^(valid|invalid|warning|error)$')
    
    # Cost validation
    cost_validation_status: str = Field(..., regex='^(valid|invalid|warning)$')
    expected_mdr_rate: Optional[Decimal] = Field(None, decimal_places=4)
    actual_mdr_rate: Optional[Decimal] = Field(None, decimal_places=4)
    expected_mdr_cost: Optional[Decimal] = Field(None, decimal_places=2)
    actual_mdr_cost: Optional[Decimal] = Field(None, decimal_places=2)
    cost_variance: Optional[Decimal] = Field(None, decimal_places=2)
    cost_variance_percentage: Optional[Decimal] = Field(None, decimal_places=2)
    
    # SLA validation
    sla_validation_status: str = Field(..., regex='^(valid|invalid|warning)$')
    expected_settlement_date: Optional[datetime] = None
    actual_settlement_date: Optional[datetime] = None
    sla_met: Optional[bool] = None
    delay_days: Optional[int] = None
    sla_type_expected: Optional[str] = Field(None, regex='^T\+[0-9]+$')
    
    # Routing validation
    routing_validation_status: str = Field(..., regex='^(valid|invalid|warning)$')
    expected_acquirer: Optional[str] = Field(None, max_length=100)
    actual_acquirer: Optional[str] = Field(None, max_length=100)
    is_optimal_routing: Optional[bool] = None
    routing_cost_impact: Optional[Decimal] = Field(None, decimal_places=2)
    routing_reason: Optional[str] = Field(None, max_length=200)
    
    # Matching information
    rate_card_id: Optional[str] = None
    rate_card_match_confidence: Optional[Decimal] = Field(None, ge=0, le=1, decimal_places=2)
    routing_rule_id: Optional[str] = None
    routing_rule_match_confidence: Optional[Decimal] = Field(None, ge=0, le=1, decimal_places=2)
    
    # Additional details
    validation_notes: Optional[str] = None
    error_details: Optional[str] = None


class ReconciliationResultCreate(ReconciliationResultBase):
    """Schema for creating a new reconciliation result"""
    reconciliation_batch_id: Optional[str] = None
    processing_time_ms: Optional[int] = None
    created_by: Optional[str] = Field(None, max_length=50)


class ReconciliationResultUpdate(BaseModel):
    """Schema for updating reconciliation result data"""
    overall_status: Optional[str] = Field(None, regex='^(valid|invalid|warning|error)$')
    validation_notes: Optional[str] = None
    error_details: Optional[str] = None


class ReconciliationResultResponse(ReconciliationResultBase):
    """Schema for reconciliation result API responses"""
    id: str
    reconciliation_date: datetime
    reconciliation_batch_id: Optional[str] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True


class ReconciliationSummary(BaseModel):
    """Schema for reconciliation summary statistics"""
    total_transactions: int
    valid_transactions: int
    invalid_transactions: int
    warning_transactions: int
    error_transactions: int
    
    cost_validation_pass_rate: Decimal
    sla_validation_pass_rate: Decimal
    routing_validation_pass_rate: Decimal
    
    total_cost_variance: Decimal
    average_cost_variance_percentage: Decimal
    total_financial_impact: Decimal
    
    average_processing_time_ms: Optional[int] = None
    reconciliation_date_range_start: Optional[datetime] = None
    reconciliation_date_range_end: Optional[datetime] = None


class ReconciliationFilters(BaseModel):
    """Schema for filtering reconciliation results"""
    transaction_id: Optional[str] = None
    overall_status: Optional[str] = None
    cost_validation_status: Optional[str] = None
    sla_validation_status: Optional[str] = None
    routing_validation_status: Optional[str] = None
    reconciliation_batch_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_cost_variance: Optional[Decimal] = None
    max_cost_variance: Optional[Decimal] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class ReconciliationBatch(BaseModel):
    """Schema for reconciliation batch processing"""
    batch_id: str
    transaction_ids: List[str]
    batch_size: int
    processing_options: dict = {}


class ReconciliationBatchStatus(BaseModel):
    """Schema for reconciliation batch status"""
    batch_id: str
    status: str = Field(..., regex='^(pending|processing|completed|failed)$')
    total_transactions: int
    processed_transactions: int
    successful_reconciliations: int
    failed_reconciliations: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None