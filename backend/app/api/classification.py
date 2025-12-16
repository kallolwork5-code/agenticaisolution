"""
Classification API endpoints for showing prompts and classification details
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.db.database import SessionLocal
from app.db.models import Prompt, Upload
import logging

logger = logging.getLogger("classification-api")

router = APIRouter()

class PromptInfo(BaseModel):
    prompt_type: str
    prompt_text: str
    version: int
    is_active: bool
    created_at: str
    updated_at: str

class ClassificationPrompts(BaseModel):
    agent_role: str
    prompts: List[PromptInfo]
    total_prompts: int

@router.get("/prompts/data-classification", response_model=ClassificationPrompts)
async def get_data_classification_prompts():
    """Get all data classification prompts from database"""
    
    db = SessionLocal()
    try:
        prompts = db.query(Prompt).filter(
            Prompt.agent_role == 'data_classification'
        ).order_by(Prompt.prompt_type).all()
        
        if not prompts:
            raise HTTPException(
                status_code=404, 
                detail="No data classification prompts found in database"
            )
        
        prompt_info = []
        for prompt in prompts:
            prompt_info.append(PromptInfo(
                prompt_type=prompt.prompt_type,
                prompt_text=prompt.prompt_text,
                version=prompt.version,
                is_active=prompt.is_active,
                created_at=prompt.created_at.isoformat(),
                updated_at=prompt.updated_at.isoformat()
            ))
        
        return ClassificationPrompts(
            agent_role="data_classification",
            prompts=prompt_info,
            total_prompts=len(prompts)
        )
        
    except Exception as e:
        logger.error(f"Error fetching classification prompts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching prompts: {str(e)}")
    finally:
        db.close()

@router.get("/prompts/data-classification/{prompt_type}")
async def get_specific_classification_prompt(prompt_type: str):
    """Get a specific data classification prompt by type"""
    
    db = SessionLocal()
    try:
        prompt = db.query(Prompt).filter(
            Prompt.agent_role == 'data_classification',
            Prompt.prompt_type == prompt_type
        ).first()
        
        if not prompt:
            raise HTTPException(
                status_code=404,
                detail=f"No {prompt_type} prompt found for data classification"
            )
        
        return {
            "agent_role": prompt.agent_role,
            "prompt_type": prompt.prompt_type,
            "prompt_text": prompt.prompt_text,
            "version": prompt.version,
            "is_active": prompt.is_active,
            "created_at": prompt.created_at.isoformat(),
            "updated_at": prompt.updated_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching {prompt_type} prompt: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching prompt: {str(e)}")
    finally:
        db.close()

@router.get("/uploads/{upload_id}/details")
async def get_upload_details(upload_id: str):
    """Get detailed information about a specific upload including prompts used"""
    
    db = SessionLocal()
    try:
        upload = db.query(Upload).filter(Upload.id == upload_id).first()
        
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        # Get the prompts that were used for this classification
        prompts_used = []
        if upload.method in ['ai_prompt', 'ai_analysis']:
            prompts = db.query(Prompt).filter(
                Prompt.agent_role == 'data_classification'
            ).all()
            
            for prompt in prompts:
                prompts_used.append({
                    "prompt_type": prompt.prompt_type,
                    "prompt_text": prompt.prompt_text[:200] + "..." if len(prompt.prompt_text) > 200 else prompt.prompt_text,
                    "version": prompt.version
                })
        
        # Parse AI insights
        ai_insights = []
        try:
            if upload.ai_insights:
                import json
                ai_insights = json.loads(upload.ai_insights)
        except:
            pass
        
        return {
            "upload_info": {
                "id": upload.id,
                "file_name": upload.file_name,
                "file_size": upload.file_size,
                "upload_date": upload.upload_date.isoformat(),
                "classification": upload.classification,
                "storage_location": upload.storage_location,
                "confidence": upload.confidence,
                "method": upload.method,
                "reasoning": upload.reasoning,
                "record_count": upload.record_count,
                "status": upload.status,
                "ai_summary": upload.ai_summary,
                "processing_time": upload.processing_time,
                "prompt_used": upload.prompt_used
            },
            "ai_insights": ai_insights,
            "prompts_used": prompts_used,
            "classification_method": {
                "method": upload.method,
                "description": {
                    "ai_prompt": "Classification performed using AI with database prompts",
                    "ai_analysis": "Classification performed using AI analysis",
                    "rule_based": "Classification performed using predefined rules",
                    "fallback": "Classification performed using fallback logic"
                }.get(upload.method, "Unknown classification method")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching upload details: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching upload details: {str(e)}")
    finally:
        db.close()

@router.get("/classification/stats")
async def get_classification_stats():
    """Get statistics about classifications performed"""
    
    db = SessionLocal()
    try:
        # Get classification method distribution
        from sqlalchemy import func
        
        method_stats = db.query(
            Upload.method,
            func.count(Upload.id).label('count'),
            func.avg(Upload.confidence).label('avg_confidence')
        ).group_by(Upload.method).all()
        
        # Get classification type distribution
        classification_stats = db.query(
            Upload.classification,
            func.count(Upload.id).label('count'),
            func.avg(Upload.confidence).label('avg_confidence')
        ).group_by(Upload.classification).all()
        
        # Get recent uploads
        recent_uploads = db.query(Upload).order_by(
            Upload.upload_date.desc()
        ).limit(10).all()
        
        return {
            "method_distribution": [
                {
                    "method": stat.method,
                    "count": stat.count,
                    "average_confidence": round(stat.avg_confidence, 3) if stat.avg_confidence else 0
                }
                for stat in method_stats
            ],
            "classification_distribution": [
                {
                    "classification": stat.classification,
                    "count": stat.count,
                    "average_confidence": round(stat.avg_confidence, 3) if stat.avg_confidence else 0
                }
                for stat in classification_stats
            ],
            "recent_uploads": [
                {
                    "id": upload.id,
                    "file_name": upload.file_name,
                    "classification": upload.classification,
                    "method": upload.method,
                    "confidence": upload.confidence,
                    "upload_date": upload.upload_date.isoformat()
                }
                for upload in recent_uploads
            ],
            "total_uploads": db.query(Upload).count()
        }
        
    except Exception as e:
        logger.error(f"Error fetching classification stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
    finally:
        db.close()