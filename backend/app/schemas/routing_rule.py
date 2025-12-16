"""
Pydantic schemas for RoutingRule model.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class RoutingRuleBase(BaseModel):
    """Base schema for routing rule data"""
    terminal_id: str = Field(..., max_length=50)
    merchant_id: Optional[str] = Field(None, max_length=50)
    payment_method: str = Field(..., max_length=50)
    card_classification: str = Field(..., max_length=50)
    network: str = Field(..., max_length=50)
    min_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    max_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    primary_acquirer: str = Field(..., max_length=100)
    secondary_acquirer: Optional[str] = Field(None, max_length=100)
    tertiary_acquirer: Optional[str] = Field(None, max_length=100)
    routing_priority: int = Field(default=1, ge=1)
    routing_weight: Optional[int] = Field(default=100, ge=1, le=100)
    time_based_routing: bool = Field(default=False)
    start_time: Optional[str] = Field(None, regex='^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: Optional[str] = Field(None, regex='^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    country_code: Optional[str] = Field(None, max_length=3)
    region: Optional[str] = Field(None, max_length=50)
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

    @validator('max_amount')
    def validate_amount_range(cls, v, values):
        if v and 'min_amount' in values and values['min_amount'] and v <= values['min_amount']:
            raise ValueError('Maximum amount must be greater than minimum amount')
        return v

    @validator('end_time')
    def validate_time_range(cls, v, values):
        if v and 'start_time' in values and values['start_time'] and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        if v and 'effective_date' in values and v <= values['effective_date']:
            raise ValueError('Expiry date must be after effective date')
        return v


class RoutingRuleCreate(RoutingRuleBase):
    """Schema for creating a new routing rule"""
    file_id: Optional[str] = None
    batch_id: Optional[str] = None
    created_by: Optional[str] = None


class RoutingRuleUpdate(BaseModel):
    """Schema for updating routing rule data"""
    primary_acquirer: Optional[str] = Field(None, max_length=100)
    secondary_acquirer: Optional[str] = Field(None, max_length=100)
    tertiary_acquirer: Optional[str] = Field(None, max_length=100)
    routing_priority: Optional[int] = Field(None, ge=1)
    routing_weight: Optional[int] = Field(None, ge=1, le=100)
    time_based_routing: Optional[bool] = None
    start_time: Optional[str] = Field(None, regex='^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: Optional[str] = Field(None, regex='^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')
    is_active: Optional[bool] = None
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None


class RoutingRuleResponse(RoutingRuleBase):
    """Schema for routing rule API responses"""
    id: str
    file_id: Optional[str] = None
    batch_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    version: int
    success_rate: Optional[Decimal] = None
    average_response_time: Optional[int] = None
    last_used: Optional[datetime] = None
    usage_count: int

    class Config:
        from_attributes = True


class RoutingRuleFilters(BaseModel):
    """Schema for filtering routing rules"""
    terminal_id: Optional[str] = None
    payment_method: Optional[str] = None
    card_classification: Optional[str] = None
    network: Optional[str] = None
    primary_acquirer: Optional[str] = None
    is_active: Optional[bool] = None
    effective_date_from: Optional[datetime] = None
    effective_date_to: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class RoutingRuleMatch(BaseModel):
    """Schema for routing rule matching results"""
    routing_rule_id: str
    confidence: Decimal = Field(..., ge=0, le=1, decimal_places=2)
    match_criteria: dict
    preferred_acquirer: str
    fallback_acquirers: list[str] = []


class RoutingDecision(BaseModel):
    """Schema for routing decision results"""
    selected_acquirer: str
    routing_rule_id: Optional[str] = None
    decision_reason: str
    confidence: Decimal = Field(..., ge=0, le=1, decimal_places=2)
    alternative_acquirers: list[str] = []
    estimated_cost_impact: Optional[Decimal] = None


class RoutingPerformance(BaseModel):
    """Schema for routing performance metrics"""
    routing_rule_id: str
    success_rate: Decimal
    average_response_time: int
    total_transactions: int
    last_30_days_usage: int
    cost_efficiency_score: Optional[Decimal] = None