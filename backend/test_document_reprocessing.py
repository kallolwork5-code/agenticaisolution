#!/usr/bin/env python3
"""
Test document reprocessing to populate ChromaDB
"""

import asyncio
from app.db.database import SessionLocal
from app.db.models import Upload
from app.services.document_processor_service import DocumentProcessor
from app.vectorstore.chroma_client import ChromaClient
import os

async def reprocess_documents():
    """Reprocess existing documents to populate ChromaDB"""
    
    db = SessionLocal()
    try:
        # Get document uploads
        documents = db.query(Upload).filter(
            Upload.classification == "document",
            Upload.status == "success"
        ).all()
        
        print(f"Found {len(documents)} documents to reprocess")
        
        if not documents:
            print("No documents found to reprocess")
            return
        
        processor = DocumentProcessor()
        chroma_client = ChromaClient()
        
        for doc in documents:
            print(f"\nReprocessing: {doc.file_name}")
            
            # Check if file exists
            file_path = f"data/uploads/{doc.id}.{doc.file_name.split('.')[-1]}"
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                continue
            
            try:
                # Process the document
                result = await processor.process_document(
                    file_path=file_path,
                    filename=doc.file_name,
                    document_id=doc.id
                )
                
                print(f"Processed successfully: {result['chunk_count']} chunks")
                
            except Exception as e:
                print(f"Error processing {doc.file_name}: {e}")
        
        # Check ChromaDB after processing
        collection = chroma_client.client.get_or_create_collection(
            name="documents",
            embedding_function=chroma_client.embedding_function
        )
        
        count = collection.count()
        print(f"\nChromaDB documents collection now has {count} items")
        
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(reprocess_documents())