from sqlalchemy.orm import Session
from app.db.models import Prompt

def create_prompt(db: Session, prompt_data):
    latest = db.query(Prompt).filter(Prompt.agent_role == prompt_data.agent_role).order_by(Prompt.version.desc()).first()
    version = latest.version + 1 if latest else 1
    db.query(Prompt).filter(Prompt.agent_role == prompt_data.agent_role).update({"is_active": False})
    prompt = Prompt(**prompt_data.dict(), version=version, is_active=True)
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt

def get_active_prompt(db: Session, agent_role: str, prompt_type: str = "system"):
    return db.query(Prompt).filter(Prompt.agent_role == agent_role, Prompt.prompt_type == prompt_type, Prompt.is_active == True).first()
