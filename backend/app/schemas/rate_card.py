"""
Pydantic schemas for RateCard model.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class RateCardBase(BaseModel):
    """Base schema for rate card data"""
    acquirer: str = Field(..., max_length=100)
    terminal_id: str = Field(..., max_length=50)
    merchant_id: Optional[str] = Field(None, max_length=50)
    payment_mode: str = Field(..., max_length=50)
    card_classification: str = Field(..., max_length=50)
    network: str = Field(..., max_length=50)
    card_category: Optional[str] = Field(None, max_length=50)
    agreed_mdr_rate: Decimal = Field(..., ge=0, le=100, decimal_places=4)
    fixed_fee: Optional[Decimal] = Field(default=Decimal('0.00'), ge=0, decimal_places=2)
    minimum_fee: Optional[Decimal] = Field(default=Decimal('0.00'), ge=0, decimal_places=2)
    maximum_fee: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    applicable_sla_days: int = Field(..., ge=0, le=30)
    sla_type: str = Field(..., regex='^T\+[0-9]+$')
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    notes: Optional[str] = None

    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        if v and 'effective_date' in values and v <= values['effective_date']:
            raise ValueError('Expiry date must be after effective date')
        return v

    @validator('maximum_fee')
    def validate_maximum_fee(cls, v, values):
        if v and 'minimum_fee' in values and values['minimum_fee'] and v < values['minimum_fee']:
            raise ValueError('Maximum fee cannot be less than minimum fee')
        return v


class RateCardCreate(RateCardBase):
    """Schema for creating a new rate card"""
    file_id: Optional[str] = None
    batch_id: Optional[str] = None
    created_by: Optional[str] = None


class RateCardUpdate(BaseModel):
    """Schema for updating rate card data"""
    agreed_mdr_rate: Optional[Decimal] = Field(None, ge=0, le=100, decimal_places=4)
    fixed_fee: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    minimum_fee: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    maximum_fee: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    applicable_sla_days: Optional[int] = Field(None, ge=0, le=30)
    sla_type: Optional[str] = Field(None, regex='^T\+[0-9]+$')
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    status: Optional[str] = Field(None, regex='^(active|inactive|expired|pending)$')
    notes: Optional[str] = None


class RateCardResponse(RateCardBase):
    """Schema for rate card API responses"""
    id: str
    file_id: Optional[str] = None
    batch_id: Optional[str] = None
    is_active: bool
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    version: int

    class Config:
        from_attributes = True


class RateCardFilters(BaseModel):
    """Schema for filtering rate cards"""
    acquirer: Optional[str] = None
    terminal_id: Optional[str] = None
    payment_mode: Optional[str] = None
    card_classification: Optional[str] = None
    network: Optional[str] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None
    effective_date_from: Optional[datetime] = None
    effective_date_to: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class RateCardMatch(BaseModel):
    """Schema for rate card matching results"""
    rate_card_id: str
    confidence: Decimal = Field(..., ge=0, le=1, decimal_places=2)
    match_criteria: dict
    calculated_mdr_cost: Decimal


class RateCardValidation(BaseModel):
    """Schema for rate card validation results"""
    is_valid: bool
    validation_date: datetime
    errors: list[str] = []
    warnings: list[str] = []