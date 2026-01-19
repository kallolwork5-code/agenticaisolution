#!/usr/bin/env python3
"""
Manually populate ChromaDB with test document content
"""

import asyncio
from app.vectorstore.chroma_client import ChromaClient
from langchain_core.documents import Document as LangChainDocument
from datetime import datetime

async def populate_test_documents():
    """Manually add test documents to ChromaDB"""
    
    client = ChromaClient()
    
    # Create test documents
    test_documents = [
        LangChainDocument(
            page_content="""
            Model Validation Report
            
            Executive Summary:
            This document presents the validation results for the credit risk model implemented in Q4 2023.
            The model demonstrates strong predictive performance with an AUC of 0.85 and stable performance
            across different time periods.
            
            Key Findings:
            - Model accuracy: 85%
            - False positive rate: 12%
            - Model stability: Good across all quarters
            - Regulatory compliance: Meets all Basel III requirements
            """,
            metadata={
                "filename": "model_validation_report.txt",
                "document_id": "test_doc_1",
                "chunk_index": 0,
                "file_type": "txt",
                "processed_at": datetime.now().isoformat()
            }
        ),
        LangChainDocument(
            page_content="""
            Technical Implementation Details:
            
            The model uses a gradient boosting algorithm with the following features:
            - Credit score
            - Income level
            - Employment history
            - Debt-to-income ratio
            - Payment history
            
            Performance Metrics:
            - Precision: 0.82
            - Recall: 0.78
            - F1-Score: 0.80
            - ROC-AUC: 0.85
            
            The model was trained on 100,000 historical records and validated on 25,000 out-of-sample records.
            """,
            metadata={
                "filename": "model_validation_report.txt",
                "document_id": "test_doc_1",
                "chunk_index": 1,
                "file_type": "txt",
                "processed_at": datetime.now().isoformat()
            }
        ),
        LangChainDocument(
            page_content="""
            Risk Assessment and Recommendations:
            
            The model shows excellent performance for the intended use case. However, we recommend:
            
            1. Monthly monitoring of model performance
            2. Quarterly recalibration if performance degrades
            3. Annual full model review and validation
            4. Implementation of challenger models for comparison
            
            Regulatory Compliance:
            The model meets all regulatory requirements including:
            - SR 11-7 guidance on model risk management
            - Basel III capital adequacy requirements
            - CCAR stress testing requirements
            
            Conclusion:
            The model is approved for production use with the recommended monitoring framework.
            """,
            metadata={
                "filename": "model_validation_report.txt",
                "document_id": "test_doc_1",
                "chunk_index": 2,
                "file_type": "txt",
                "processed_at": datetime.now().isoformat()
            }
        )
    ]
    
    try:
        # Add documents to ChromaDB
        await client.add_documents(test_documents, "documents")
        print(f"Successfully added {len(test_documents)} test documents to ChromaDB")
        
        # Verify the documents were added
        collection = client.client.get_or_create_collection(
            name="documents",
            embedding_function=client.embedding_function
        )
        
        count = collection.count()
        print(f"ChromaDB documents collection now has {count} items")
        
        # Test a query
        results = await client.query_documents(
            query="What is the model accuracy?",
            collection_name="documents",
            n_results=3
        )
        
        print(f"Test query returned {len(results.get('documents', [[]])[0])} results")
        if results.get('documents') and results['documents'][0]:
            print(f"First result preview: {results['documents'][0][0][:200]}...")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(populate_test_documents())