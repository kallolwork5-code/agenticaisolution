#!/usr/bin/env python3
"""
Test AI insights RAG response generation
"""

import asyncio
from app.services.ai_insights_service import ai_insights_service

async def test_rag_response():
    """Test RAG response generation"""
    
    test_context = """
    Model Validation Report - Executive Summary
    
    This document presents the validation results for the credit risk model implemented in Q4 2023.
    The model demonstrates strong predictive performance with an AUC of 0.85 and stable performance
    across different time periods.
    
    Key Performance Metrics:
    - Model accuracy: 85%
    - False positive rate: 12%
    - Model stability: Good across all quarters
    - Regulatory compliance: Meets all Basel III requirements
    """
    
    test_query = "What is the model accuracy?"
    
    print(f"Testing RAG response generation...")
    print(f"Query: {test_query}")
    print(f"Context length: {len(test_context)} characters")
    
    try:
        response = await ai_insights_service.generate_rag_response(
            query=test_query,
            context=test_context,
            document_ids=["test_doc"]
        )
        
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_response())