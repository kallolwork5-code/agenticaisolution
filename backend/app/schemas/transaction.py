"""
Pydantic schemas for Transaction model.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class TransactionBase(BaseModel):
    """Base schema for transaction data"""
    transaction_date: datetime
    settlement_date: datetime
    acquirer_name: str = Field(..., max_length=100)
    card_type: str = Field(..., max_length=50)
    network_type: str = Field(..., max_length=50)
    transaction_amount: Decimal = Field(..., gt=0, decimal_places=2)
    mdr_percentage: Decimal = Field(..., ge=0, le=100, decimal_places=4)
    mdr_cost: Decimal = Field(..., ge=0, decimal_places=2)
    gross_settlement_cost: Decimal = Field(..., ge=0, decimal_places=2)
    currency: str = Field(default='USD', max_length=3)
    terminal_id: str = Field(..., max_length=50)
    merchant_id: Optional[str] = Field(None, max_length=50)
    transaction_reference: Optional[str] = Field(None, max_length=100)

    @validator('currency')
    def validate_currency(cls, v):
        if len(v) != 3:
            raise ValueError('Currency must be a 3-character code')
        return v.upper()

    @validator('settlement_date')
    def validate_settlement_date(cls, v, values):
        if 'transaction_date' in values and v < values['transaction_date']:
            raise ValueError('Settlement date cannot be before transaction date')
        return v


class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction"""
    file_id: Optional[str] = None
    batch_id: Optional[str] = None


class TransactionUpdate(BaseModel):
    """Schema for updating transaction data"""
    status: Optional[str] = Field(None, regex='^(pending|validated|reconciled|error)$')
    validation_errors: Optional[str] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction API responses"""
    id: str
    file_id: Optional[str] = None
    batch_id: Optional[str] = None
    status: str
    validation_errors: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionFilters(BaseModel):
    """Schema for filtering transactions"""
    acquirer_name: Optional[str] = None
    card_type: Optional[str] = None
    network_type: Optional[str] = None
    terminal_id: Optional[str] = None
    status: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)


class TransactionSummary(BaseModel):
    """Schema for transaction summary statistics"""
    total_transactions: int
    total_amount: Decimal
    total_mdr_cost: Decimal
    average_mdr_percentage: Decimal
    unique_acquirers: int
    unique_terminals: int
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None