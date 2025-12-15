"""
Prompt repository service.

Key behavior:
- UPSERT by (agent_role, prompt_type)
- No implicit version increment
- Safe for production use
"""

from sqlalchemy.orm import Session
from app.db.models import Prompt


def create_prompt(db: Session, prompt_data):
    """
    Create or update a prompt.

    Rules:
    - If (agent_role, prompt_type) exists → UPDATE
    - Else → CREATE
    - Version remains unchanged unless explicitly modified
    """

    prompt = db.query(Prompt).filter(
        Prompt.agent_role == prompt_data.agent_role,
        Prompt.prompt_type == prompt_data.prompt_type
    ).first()

    if prompt:
        prompt.prompt_text = prompt_data.prompt_text
        prompt.is_active = True
    else:
        prompt = Prompt(
            agent_role=prompt_data.agent_role,
            prompt_type=prompt_data.prompt_type,
            prompt_text=prompt_data.prompt_text,
            version=1,
            is_active=True
        )
        db.add(prompt)

    db.commit()
    db.refresh(prompt)
    return prompt


def get_active_prompt(db: Session, agent_role: str, prompt_type: str):
    """
    Fetch active prompt for a given agent role and prompt type.
    """
    return db.query(Prompt).filter(
        Prompt.agent_role == agent_role,
        Prompt.prompt_type == prompt_type,
        Prompt.is_active == True
    ).first()
