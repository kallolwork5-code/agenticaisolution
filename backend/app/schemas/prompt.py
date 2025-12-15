from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PromptBase(BaseModel):
    agent_role: str
    prompt_type: str = "system"
    prompt_text: str

class PromptCreate(PromptBase):
    created_by: Optional[str] = None

class PromptResponse(PromptBase):
    id: int
    version: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
