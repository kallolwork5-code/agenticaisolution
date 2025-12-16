from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import os
from pydantic import BaseModel
import logging

from ..agents.ai_query_agent import AIQueryAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-engine", tags=["ai-engine"])

# Initialize AI Query Agent
try:
    ai_agent = AIQueryAgent()
except ValueError as e:
    logger.warning(f"AI Agent initialization failed: {str(e)}")
    ai_agent = None

# Request/Response models
class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class SQLQueryRequest(BaseModel):
    sql: str

class QueryResponse(BaseModel):
    status: str
    query: str
    response: Optional[str] = None
    analysis: Optional[Dict] = None
    data_sources: Optional[list] = None
    timestamp: str
    error: Optional[str] = None

@router.post("/query", response_model=QueryResponse)
async def process_natural_language_query(request: QueryRequest):
    """
    Process natural language queries about uploaded data
    """
    try:
        if not ai_agent:
            raise HTTPException(
                status_code=503, 
                detail="AI Engine is not available. Please check OpenAI API key configuration."
            )
        
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Process the query
        result = ai_agent.process_query(request.query, request.context)
        
        return QueryResponse(**result)
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@router.post("/sql")
async def execute_sql_query(request: SQLQueryRequest):
    """
    Execute SQL queries directly (for advanced users)
    """
    try:
        if not ai_agent:
            raise HTTPException(
                status_code=503, 
                detail="AI Engine is not available. Please check OpenAI API key configuration."
            )
        
        if not request.sql.strip():
            raise HTTPException(status_code=400, detail="SQL query cannot be empty")
        
        # Execute SQL query
        result = ai_agent.execute_sql_query(request.sql)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Error executing SQL query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL execution failed: {str(e)}")

@router.get("/data-summary")
async def get_data_summary():
    """
    Get summary of available data sources
    """
    try:
        if not ai_agent:
            raise HTTPException(
                status_code=503, 
                detail="AI Engine is not available. Please check OpenAI API key configuration."
            )
        
        summary = ai_agent.get_available_data_summary()
        
        return JSONResponse(content={
            'status': 'success',
            'data_summary': summary
        })
        
    except Exception as e:
        logger.error(f"Error getting data summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get data summary: {str(e)}")

@router.get("/sample-queries")
async def get_sample_queries():
    """
    Get sample queries that users can try
    """
    sample_queries = [
        {
            "category": "Transaction Analysis",
            "queries": [
                "What is the total amount of transactions?",
                "What is the average transaction amount?",
                "How many transactions were processed today?",
                "Show me the top 10 merchants by transaction volume"
            ]
        },
        {
            "category": "Cost Analysis",
            "queries": [
                "What is the average MDR rate?",
                "What are the total processing costs?",
                "Which payment method has the highest costs?",
                "Show me cost breakdown by merchant"
            ]
        },
        {
            "category": "Performance Metrics",
            "queries": [
                "What is the success rate of transactions?",
                "How many failed transactions do we have?",
                "What is the average processing time?",
                "Show me SLA compliance metrics"
            ]
        },
        {
            "category": "Document Search",
            "queries": [
                "What are the payment processing rules?",
                "Explain the refund policy",
                "What are the compliance requirements?",
                "Find information about chargeback procedures"
            ]
        }
    ]
    
    return JSONResponse(content={
        'status': 'success',
        'sample_queries': sample_queries
    })

@router.get("/health")
async def health_check():
    """
    Check AI Engine health status
    """
    try:
        status = {
            'ai_agent_available': ai_agent is not None,
            'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
            'status': 'healthy' if ai_agent else 'degraded'
        }
        
        if ai_agent:
            # Test basic functionality
            try:
                summary = ai_agent.get_available_data_summary()
                status['data_sources_available'] = bool(summary.get('total_tables', 0) > 0 or summary.get('total_documents', 0) > 0)
            except Exception:
                status['data_sources_available'] = False
        
        return JSONResponse(content=status)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                'status': 'unhealthy',
                'error': str(e)
            }
        )

@router.get("/tables")
async def get_available_tables():
    """
    Get list of available database tables with schema info
    """
    try:
        if not ai_agent:
            raise HTTPException(
                status_code=503, 
                detail="AI Engine is not available"
            )
        
        # Get structured data context (this will include table schemas)
        context = ai_agent._get_structured_data_context("", {})
        
        return JSONResponse(content={
            'status': 'success',
            'tables': context.get('tables', []),
            'total_tables': len(context.get('tables', []))
        })
        
    except Exception as e:
        logger.error(f"Error getting tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tables: {str(e)}")

@router.get("/documents")
async def get_available_documents():
    """
    Get list of available document collections
    """
    try:
        if not ai_agent:
            raise HTTPException(
                status_code=503, 
                detail="AI Engine is not available"
            )
        
        # Get document collections info
        try:
            collections = ai_agent.doc_agent.chroma_client.list_collections()
            collection_names = [coll.name for coll in collections]
        except Exception:
            collection_names = []
        
        collection_info = []
        for collection_name in collection_names:
            try:
                collection = ai_agent.doc_agent.chroma_client.get_collection(collection_name)
                count = collection.count()
                collection_info.append({
                    'name': collection_name,
                    'chunk_count': count,
                    'sample_sources': []  # Could be enhanced to get actual sources
                })
            except Exception as e:
                logger.warning(f"Error getting info for collection {collection_name}: {str(e)}")
                continue
        
        return JSONResponse(content={
            'status': 'success',
            'collections': collection_info,
            'total_collections': len(collection_info)
        })
        
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")