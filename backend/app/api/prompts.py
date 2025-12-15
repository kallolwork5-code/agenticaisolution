from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.schemas.prompt import PromptCreate, PromptResponse
from app.services.prompt_service import create_prompt, get_active_prompt

router = APIRouter(prefix="/prompts", tags=["Prompt Repository"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PromptResponse)
def create_new_prompt(prompt: PromptCreate, db: Session = Depends(get_db)):
    return create_prompt(db, prompt)

@router.get("/active", response_model=PromptResponse)
def fetch_active_prompt(agent_role: str, prompt_type: str = "system", db: Session = Depends(get_db)):
    prompt = get_active_prompt(db, agent_role, prompt_type)
    if not prompt:
        raise HTTPException(status_code=404, detail="No active prompt found")
    return prompt
