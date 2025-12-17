#!/usr/bin/env python3
"""
Test script to verify that sentence transformers are not loaded at import time
"""

import sys
import time
import importlib
import logging

# Set up logging to capture initialization messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(name)s | %(message)s')

def test_import_without_initialization():
    """Test that importing modules doesn't trigger sentence transformer loading"""
    print("🧪 Testing Module Import Without Initialization")
    print("=" * 50)
    
    # List of modules that previously caused initialization issues
    test_modules = [
        'app.api.schema_management',
        'app.api.enhanced_file_upload', 
        'app.api.ingest',
        'app.vectorstore.embeddings',
        'app.vectorstore.chroma_client',
        'app.services.ai_insights_service'
    ]
    
    for module_name in test_modules:
        print(f"\n📦 Testing import of {module_name}...")
        start_time = time.time()
        
        try:
            # Import the module
            module = importlib.import_module(module_name)
            import_time = time.time() - start_time
            
            print(f"✅ Import successful in {import_time:.3f}s")
            
            # Check if the import was fast (should be < 1 second if no heavy initialization)
            if import_time > 1.0:
                print(f"⚠️  Import took {import_time:.3f}s - might be loading heavy models")
            else:
                print(f"🚀 Fast import ({import_time:.3f}s) - no heavy initialization detected")
                
        except Exception as e:
            print(f"❌ Import failed: {e}")
    
    print(f"\n📊 Import Test Summary:")
    print(f"   - All modules should import quickly (< 1 second)")
    print(f"   - No 'Load pretrained SentenceTransformer' messages should appear")
    print(f"   - No 'Building ingestion agent graph' messages should appear")

def test_lazy_initialization():
    """Test that lazy initialization works when actually needed"""
    print(f"\n🔄 Testing Lazy Initialization")
    print("=" * 30)
    
    try:
        # Test embedding function lazy initialization
        print("📦 Testing embedding function lazy initialization...")
        from app.vectorstore.embeddings import get_embedding_function
        
        print("✅ get_embedding_function imported successfully")
        
        # Now actually call it to trigger initialization
        print("🔄 Calling get_embedding_function() to trigger initialization...")
        start_time = time.time()
        embedding_func = get_embedding_function()
        init_time = time.time() - start_time
        
        print(f"✅ Embedding function initialized in {init_time:.3f}s")
        print(f"📋 Function name: {embedding_func.name()}")
        
        # Test that subsequent calls are fast (cached)
        print("🔄 Testing cached access...")
        start_time = time.time()
        embedding_func2 = get_embedding_function()
        cached_time = time.time() - start_time
        
        print(f"✅ Cached access in {cached_time:.6f}s")
        print(f"📋 Same instance: {embedding_func is embedding_func2}")
        
    except Exception as e:
        print(f"❌ Lazy initialization test failed: {e}")
        import traceback
        traceback.print_exc()

def test_api_endpoints_ready():
    """Test that API endpoints are ready without heavy initialization"""
    print(f"\n🌐 Testing API Endpoints Readiness")
    print("=" * 35)
    
    try:
        # Test that we can import API routers without triggering heavy initialization
        api_modules = [
            'app.api.upload',
            'app.api.schema_management',
            'app.api.ingest'
        ]
        
        for module_name in api_modules:
            print(f"📦 Testing {module_name}...")
            start_time = time.time()
            
            module = importlib.import_module(module_name)
            import_time = time.time() - start_time
            
            # Check if the module has a router
            if hasattr(module, 'router'):
                print(f"✅ Router available in {import_time:.3f}s")
            else:
                print(f"⚠️  No router found in module")
        
        print(f"\n✅ All API modules imported successfully")
        print(f"📋 FastAPI should be able to start quickly now")
        
    except Exception as e:
        print(f"❌ API readiness test failed: {e}")

if __name__ == "__main__":
    print("🧪 Initialization Fix Verification Test")
    print("=" * 50)
    
    # Test 1: Import modules without triggering heavy initialization
    test_import_without_initialization()
    
    # Test 2: Verify lazy initialization works when needed
    test_lazy_initialization()
    
    # Test 3: Verify API endpoints are ready
    test_api_endpoints_ready()
    
    print(f"\n🎯 CONCLUSION:")
    print(f"   If no 'Load pretrained SentenceTransformer' messages appeared during imports,")
    print(f"   and lazy initialization worked correctly, then the fix is successful!")
    print(f"   The FastAPI server should now start quickly without continuous model loading.")