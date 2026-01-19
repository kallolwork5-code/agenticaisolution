#!/usr/bin/env python3
"""
Test ChromaDB with built-in embedding function
"""

from chromadb import Client
from chromadb.config import Settings
import chromadb.utils.embedding_functions as embedding_functions

def test_chroma_builtin():
    """Test ChromaDB with built-in embedding function"""
    
    # Create client
    client = Client(Settings(
        persist_directory="./data/chroma_db",
        anonymized_telemetry=False
    ))
    
    # Use built-in sentence transformer embedding function
    embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    try:
        # Create collection
        collection = client.get_or_create_collection(
            name="test_builtin",
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
        
        print(f"Query successful!")
        print(f"Found {len(results.get('documents', [[]])[0])} results")
        
        if results.get('documents') and results['documents'][0]:
            print(f"Found: {results['documents'][0][0]}")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_chroma_builtin()