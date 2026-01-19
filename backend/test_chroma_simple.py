#!/usr/bin/env python3
"""
Simple ChromaDB test
"""

from chromadb import Client
from chromadb.config import Settings
from app.vectorstore.embeddings import get_embedding_function

def test_chroma_simple():
    """Simple ChromaDB test"""
    
    # Create client
    client = Client(Settings(
        persist_directory="./data/chroma_db",
        anonymized_telemetry=False
    ))
    
    embedding_function = get_embedding_function()
    
    try:
        # Create collection
        collection = client.get_or_create_collection(
            name="test_documents",
            embedding_function=embedding_function
        )
        
        # Add a simple document
        collection.add(
            documents=["This is a test document about model validation and accuracy metrics."],
            metadatas=[{"source": "test"}],
            ids=["test_1"]
        )
        
        print("Document added successfully")
        
        # Query immediately
        results = collection.query(
            query_texts=["model accuracy"],
            n_results=1
        )
        
        print(f"Query results: {results}")
        
        if results.get('documents') and results['documents'][0]:
            print(f"Found: {results['documents'][0][0]}")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_chroma_simple()