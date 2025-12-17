from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import logging
import json

from ..db.database import get_db
from ..models.file_upload import UploadedFile, DataSchema
from ..models.file_summary import FileSummary
from ..agents.data_ingestion import DataIngestionAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/schemas", tags=["schema-management"])

# Lazy initialization of agents
_ingestion_agent = None

def get_ingestion_agent():
    """Get ingestion agent with lazy initialization"""
    global _ingestion_agent
    if _ingestion_agent is None:
        _ingestion_agent = DataIngestionAgent()
        logger.info("DataIngestionAgent initialized on first use")
    return _ingestion_agent

@router.get("/list")
async def list_schemas(db: Session = Depends(get_db)):
    """Get all existing schemas and their usage statistics"""
    try:
        # Get all unique schemas from uploaded files
        schemas_query = db.query(UploadedFile).filter(
            UploadedFile.detected_schema.isnot(None),
            UploadedFile.status.in_(['completed', 'duplicate'])
        ).all()
        
        # Group by data type and schema structure
        schema_groups = {}
        
        for file_record in schemas_query:
            data_type = file_record.data_type or 'unknown'
            table_name = file_record.table_name
            
            if table_name not in schema_groups:
                schema_groups[table_name] = {
                    'table_name': table_name,
                    'data_type': data_type,
                    'schema': file_record.detected_schema,
                    'files': [],
                    'total_records': 0,
                    'created_at': file_record.upload_timestamp,
                    'last_updated': file_record.upload_timestamp
                }
            
            # Add file info
            schema_groups[table_name]['files'].append({
                'file_id': file_record.id,
                'filename': file_record.original_name,
                'records': file_record.processed_records or 0,
                'uploaded_at': file_record.upload_timestamp.isoformat() if file_record.upload_timestamp else None,
                'status': file_record.status
            })
            
            # Update statistics
            schema_groups[table_name]['total_records'] += file_record.processed_records or 0
            if file_record.upload_timestamp > schema_groups[table_name]['last_updated']:
                schema_groups[table_name]['last_updated'] = file_record.upload_timestamp
        
        # Convert to list and add table info from SQLite
        schemas_list = []
        for table_name, schema_info in schema_groups.items():
            # Get actual table info from SQLite
            ingestion_agent = get_ingestion_agent()
            table_info = ingestion_agent.get_table_info(table_name)
            
            schema_info.update({
                'file_count': len(schema_info['files']),
                'actual_row_count': table_info.get('row_count', 0),
                'columns': table_info.get('columns', []),
                'created_at': schema_info['created_at'].isoformat() if schema_info['created_at'] else None,
                'last_updated': schema_info['last_updated'].isoformat() if schema_info['last_updated'] else None
            })
            
            schemas_list.append(schema_info)
        
        # Sort by last updated (most recent first)
        schemas_list.sort(key=lambda x: x['last_updated'] or '', reverse=True)
        
        return JSONResponse(content={
            'status': 'success',
            'schemas': schemas_list,
            'total_schemas': len(schemas_list)
        })
        
    except Exception as e:
        logger.error(f"Error listing schemas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tables/{table_name}/preview")
async def get_table_preview(table_name: str, limit: int = 10):
    """Get a preview of data from a specific table"""
    try:
        ingestion_agent = get_ingestion_agent()
        table_data = ingestion_agent.get_table_data(table_name, limit=limit, offset=0)
        
        if 'error' in table_data:
            raise HTTPException(status_code=404, detail=table_data['error'])
        
        return JSONResponse(content={
            'status': 'success',
            'table_name': table_name,
            'preview_data': table_data['data'],
            'columns': table_data['columns'],
            'total_rows_shown': len(table_data['data'])
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting table preview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/files/{file_id}/generate-summary")
async def generate_file_summary(
    file_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate an AI summary for a specific file upload"""
    try:
        # Check if file exists
        file_record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if summary already exists
        existing_summary = db.query(FileSummary).filter(FileSummary.file_id == file_id).first()
        if existing_summary:
            return JSONResponse(content={
                'status': 'success',
                'message': 'Summary already exists',
                'summary': {
                    'id': existing_summary.id,
                    'summary_text': existing_summary.summary_text,
                    'key_insights': existing_summary.key_insights,
                    'data_quality_score': existing_summary.data_quality_score,
                    'generated_at': existing_summary.generated_at.isoformat()
                }
            })
        
        # Start background summary generation
        background_tasks.add_task(
            generate_summary_background,
            file_id=file_id,
            file_record=file_record
        )
        
        return JSONResponse(content={
            'status': 'success',
            'message': 'Summary generation started in background',
            'file_id': file_id
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting summary generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files/{file_id}/summary")
async def get_file_summary(file_id: str, db: Session = Depends(get_db)):
    """Get the summary for a specific file"""
    try:
        summary = db.query(FileSummary).filter(FileSummary.file_id == file_id).first()
        
        if not summary:
            return JSONResponse(content={
                'status': 'not_found',
                'message': 'No summary found for this file'
            })
        
        return JSONResponse(content={
            'status': 'success',
            'summary': {
                'id': summary.id,
                'summary_text': summary.summary_text,
                'key_insights': summary.key_insights,
                'data_quality_score': summary.data_quality_score,
                'generated_at': summary.generated_at.isoformat(),
                'model_used': summary.model_used,
                'is_approved': summary.is_approved,
                'needs_review': summary.needs_review
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting file summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_summary_background(file_id: str, file_record: UploadedFile):
    """Background task to generate AI summary for a file"""
    from ..db.database import SessionLocal
    
    db = SessionLocal()
    try:
        logger.info(f"Starting summary generation for file {file_id}")
        
        # Get file data for analysis
        analysis_data = {
            'filename': file_record.original_name,
            'data_type': file_record.data_type,
            'file_size': file_record.file_size,
            'processed_records': file_record.processed_records,
            'schema': file_record.detected_schema,
            'table_name': file_record.table_name,
            'upload_date': file_record.upload_timestamp.isoformat() if file_record.upload_timestamp else None
        }
        
        # Get sample data if available
        if file_record.table_name:
            try:
                ingestion_agent = get_ingestion_agent()
                sample_data = ingestion_agent.get_table_data(file_record.table_name, limit=5)
                analysis_data['sample_data'] = sample_data.get('data', [])
                analysis_data['columns'] = sample_data.get('columns', [])
            except Exception as e:
                logger.warning(f"Could not get sample data: {str(e)}")
        
        # Generate summary using a simple template (you can replace this with actual LLM call)
        summary_text = generate_simple_summary(analysis_data)
        key_insights = extract_key_insights(analysis_data)
        data_quality_score = assess_data_quality(analysis_data)
        
        # Save summary to database
        summary = FileSummary(
            file_id=file_id,
            summary_text=summary_text,
            key_insights=key_insights,
            data_quality_score=data_quality_score,
            model_used='template-based',  # Replace with actual model name when using LLM
            generated_at=datetime.utcnow()
        )
        
        db.add(summary)
        db.commit()
        
        logger.info(f"Summary generated successfully for file {file_id}")
        
    except Exception as e:
        logger.error(f"Error generating summary for {file_id}: {str(e)}")
    finally:
        db.close()

def generate_simple_summary(data: Dict) -> str:
    """Generate a simple summary based on file data"""
    filename = data.get('filename', 'Unknown file')
    data_type = data.get('data_type', 'unknown')
    records = data.get('processed_records', 0)
    columns = data.get('columns', [])
    
    summary = f"""File Analysis Summary for {filename}

Data Type: {data_type.title()}
Total Records: {records:,}
Columns: {len(columns)}

This file contains {data_type} data with {records:,} records across {len(columns)} columns."""
    
    if data.get('sample_data'):
        summary += f"\n\nThe data includes information such as: {', '.join(columns[:5])}{'...' if len(columns) > 5 else ''}."
    
    return summary

def extract_key_insights(data: Dict) -> List[str]:
    """Extract key insights from the data"""
    insights = []
    
    records = data.get('processed_records', 0)
    if records > 1000:
        insights.append(f"Large dataset with {records:,} records")
    elif records > 100:
        insights.append(f"Medium-sized dataset with {records:,} records")
    else:
        insights.append(f"Small dataset with {records:,} records")
    
    columns = data.get('columns', [])
    if len(columns) > 10:
        insights.append(f"Rich data structure with {len(columns)} columns")
    
    data_type = data.get('data_type')
    if data_type == 'transaction':
        insights.append("Contains transactional data suitable for financial analysis")
    elif data_type == 'reference':
        insights.append("Contains reference data for lookups and configuration")
    
    return insights

def assess_data_quality(data: Dict) -> str:
    """Assess data quality based on available information"""
    records = data.get('processed_records', 0)
    columns = data.get('columns', [])
    
    if records > 100 and len(columns) > 3:
        return "High"
    elif records > 10 and len(columns) > 1:
        return "Medium"
    else:
        return "Low"