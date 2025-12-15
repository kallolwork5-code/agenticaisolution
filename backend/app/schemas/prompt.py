"""
Pydantic schemas for the Prompt Repository.

WHY THIS FILE EXISTS:
- Defines API request/response contracts
- Prevents leaking SQLAlchemy models to the API layer
- Acts as a stable boundary between API and persistence
- Avoids circular imports by having ZERO dependencies on services or APIs

IMPORTANT RULE:
- This file must NOT import from app.api, app.services, or itself
"""

from pydantic import BaseModel
from datetime import datetime


class PromptBase(BaseModel):
    """
    Base schema shared across prompt requests and responses.

    WHY:
    - Ensures consistent fields
    - Avoids duplication
    """
    agent_role: str
    prompt_type: str
    prompt_text: str


class PromptCreate(PromptBase):
    """
    Schema used for creating or updating (UPSERT) a prompt.

    WHY:
    - Same schema is used for both create and update
    - Prompt uniqueness is enforced by (agent_role, prompt_type)
    """
    pass


class PromptResponse(PromptBase):
    """
    Schema returned by the Prompt APIs.

    WHY:
    - Exposes metadata needed for audit and debugging
    - Hides internal DB implementation details
    """
    id: int
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
