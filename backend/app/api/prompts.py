"""
Prompt repository API.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import SessionLocal
from app.schemas.prompt import PromptCreate, PromptResponse
from app.services.prompt_service import create_prompt, get_active_prompt
from app.db.models import Prompt

router = APIRouter(prefix="/prompts")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PromptResponse)
def create_prompt_api(prompt: PromptCreate, db: Session = Depends(get_db)):
    return create_prompt(db, prompt)

@router.get("/active", response_model=PromptResponse)
def get_active(agent_role: str, prompt_type: str = "system", db: Session = Depends(get_db)):
    prompt = get_active_prompt(db, agent_role, prompt_type)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.get("/", response_model=List[PromptResponse])
def list_prompts(agent_role: str = None, prompt_type: str = None, db: Session = Depends(get_db)):
    """List all prompts with optional filtering by agent_role and prompt_type"""
    query = db.query(Prompt)
    
    if agent_role:
        query = query.filter(Prompt.agent_role == agent_role)
    if prompt_type:
        query = query.filter(Prompt.prompt_type == prompt_type)
    
    return query.order_by(Prompt.agent_role, Prompt.prompt_type).all()

@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    """Get a specific prompt by ID"""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(prompt_id: int, prompt_data: PromptCreate, db: Session = Depends(get_db)):
    """Update a specific prompt by ID"""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt.agent_role = prompt_data.agent_role
    prompt.prompt_type = prompt_data.prompt_type
    prompt.prompt_text = prompt_data.prompt_text
    prompt.is_active = True
    
    db.commit()
    db.refresh(prompt)
    return prompt

@router.delete("/{prompt_id}")
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    """Delete a specific prompt by ID"""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}

@router.get("/agents/roles")
def get_agent_roles(db: Session = Depends(get_db)):
    """Get all unique agent roles"""
    roles = db.query(Prompt.agent_role).distinct().all()
    return [role[0] for role in roles]

@router.get("/types/all")
def get_prompt_types(db: Session = Depends(get_db)):
    """Get all unique prompt types"""
    types = db.query(Prompt.prompt_type).distinct().all()
    return [type_[0] for type_ in types]
