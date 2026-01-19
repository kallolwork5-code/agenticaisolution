#!/usr/bin/env python3
"""
Step by step debugging of Talk2Data service
"""

import asyncio
from app.api.talk2data import Talk2DataService
from app.services.ai_insights_service import ai_insights_service

async def debug_step_by_step():
    """Debug step by step"""
    
    service = Talk2DataService()
    
    query = "What is the model accuracy?"
    document_ids = ["test_doc"]
    
    print("Step 1: Testing ChromaDB query...")
    try:
        results = await service.chroma_client.query_documents(
            query=query,
            collection_name="documents",
            n_results=5
        )
        print(f"ChromaDB results: {results}")
        
        # Check if documents exist
        all_results = []
        if results and 'documents' in results and results['documents'] and results['documents'][0]:
            all_results = results['documents'][0]
            print(f"Found {len(all_results)} documents in ChromaDB")
        
        # If no documents found in ChromaDB, use demo content
        if not all_results:
            print("No documents in ChromaDB, using demo content")
            all_results = [
                """Model Validation Report - Executive Summary
                
                This document presents the validation results for the credit risk model implemented in Q4 2023.
                The model demonstrates strong predictive performance with an AUC of 0.85 and stable performance
                across different time periods.
                
                Key Performance Metrics:
                - Model accuracy: 85%
                - False positive rate: 12%
                - Model stability: Good across all quarters
                - Regulatory compliance: Meets all Basel III requirements"""
            ]
            print(f"Using {len(all_results)} demo documents")
        
        print("\nStep 2: Testing RAG response generation...")
        if all_results:
            context = "\n\n".join(all_results[:3])
            print(f"Context length: {len(context)} characters")
            print(f"Context preview: {context[:200]}...")
            
            response = await ai_insights_service.generate_rag_response(
                query=query,
                context=context,
                document_ids=document_ids
            )
            
            print(f"RAG response: {response}")
            
            return {
                "response": response,
                "sources": all_results[:3],
                "document_count": len(document_ids)
            }
        else:
            print("No results available")
            return {
                "response": "No documents found",
                "sources": [],
                "document_count": 0
            }
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    result = asyncio.run(debug_step_by_step())
    print(f"\nFinal result: {result}")