#!/usr/bin/env python3
"""
Debug embedding function
"""

from app.vectorstore.embeddings import get_embedding_function

def test_embedding():
    """Test embedding function"""
    
    embedding_function = get_embedding_function()
    
    # Test __call__ method
    result1 = embedding_function("test query")
    print(f"__call__ result type: {type(result1)}")
    print(f"__call__ result length: {len(result1)}")
    print(f"__call__ first few values: {result1[:5]}")
    
    # Test embed_query method
    result2 = embedding_function.embed_query("test query")
    print(f"embed_query result type: {type(result2)}")
    print(f"embed_query result length: {len(result2)}")
    print(f"embed_query first few values: {result2[:5]}")
    
    # Test embed_documents method
    result3 = embedding_function.embed_documents(["test query"])
    print(f"embed_documents result type: {type(result3)}")
    print(f"embed_documents result length: {len(result3)}")
    print(f"embed_documents first item type: {type(result3[0])}")
    print(f"embed_documents first item length: {len(result3[0])}")

if __name__ == "__main__":
    test_embedding()