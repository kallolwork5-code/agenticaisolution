import os
import json
import sqlite3
from typing import Dict, List, Optional, Any
from pathlib import Path
import logging
from datetime import datetime

# OpenAI integration
from openai import OpenAI

# Import our existing agents
from .data_ingestion import DataIngestionAgent
from .document_processor import DocumentProcessingAgent

logger = logging.getLogger(__name__)

class AIQueryAgent:
    """
    AI-powered query agent that can answer questions about uploaded data
    using both structured data (SQLite) and documents (RAG)
    """
    
    def __init__(self, 
                 openai_api_key: Optional[str] = None,
                 db_path: str = "data/collectisense.db",
                 documents_path: str = "data/documents"):
        
        # Initialize OpenAI client
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.openai_api_key)
        self.model = "gpt-4o-mini"
        
        # Initialize data access agents
        self.data_agent = DataIngestionAgent(db_path)
        self.doc_agent = DocumentProcessingAgent(documents_path)
        
        self.db_path = db_path
        
        # Query history for context
        self.query_history = []
    
    def process_query(self, query: str, user_context: Optional[Dict] = None) -> Dict:
        """
        Main method to process natural language queries
        """
        try:
            logger.info(f"Processing query: {query}")
            
            # Step 1: Analyze query intent
            query_analysis = self._analyze_query_intent(query)
            
            # Step 2: Gather relevant data based on intent
            context_data = self._gather_context_data(query, query_analysis)
            
            # Step 3: Generate response using OpenAI
            response = self._generate_ai_response(query, context_data, query_analysis)
            
            # Step 4: Store query in history
            self._store_query_history(query, response, query_analysis)
            
            return {
                'status': 'success',
                'query': query,
                'response': response,
                'analysis': query_analysis,
                'data_sources': context_data.get('sources', []),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                'status': 'error',
                'query': query,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _analyze_query_intent(self, query: str) -> Dict:
        """
        Analyze the query to determine intent and data requirements
        """
        analysis_prompt = f"""
        Analyze this query and determine:
        1. Query type (aggregation, search, comparison, listing, etc.)
        2. Data sources needed (structured_data, documents, or both)
        3. Key entities mentioned (amounts, merchants, dates, etc.)
        4. SQL operations needed (if any)
        
        Query: "{query}"
        
        Respond in JSON format:
        {{
            "query_type": "aggregation|search|comparison|listing|analysis",
            "data_sources": ["structured_data", "documents"],
            "entities": ["list of key entities"],
            "requires_sql": true/false,
            "requires_documents": true/false,
            "confidence": 0.0-1.0
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a query analysis expert. Analyze queries and respond only in valid JSON format."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.1,
                max_tokens=300
            )
            
            analysis_text = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                analysis = json.loads(analysis_text)
            except json.JSONDecodeError:
                # Fallback analysis
                analysis = self._fallback_query_analysis(query)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in query analysis: {str(e)}")
            return self._fallback_query_analysis(query)
    
    def _fallback_query_analysis(self, query: str) -> Dict:
        """Fallback query analysis using simple keyword matching"""
        query_lower = query.lower()
        
        # Determine query type
        if any(word in query_lower for word in ['total', 'sum', 'count', 'average', 'avg']):
            query_type = 'aggregation'
        elif any(word in query_lower for word in ['show', 'list', 'top', 'bottom']):
            query_type = 'listing'
        elif any(word in query_lower for word in ['compare', 'vs', 'versus', 'difference']):
            query_type = 'comparison'
        elif any(word in query_lower for word in ['find', 'search', 'look for']):
            query_type = 'search'
        else:
            query_type = 'analysis'
        
        # Determine data sources
        requires_sql = any(word in query_lower for word in [
            'transaction', 'amount', 'merchant', 'rate', 'mdr', 'total', 'count', 'sum'
        ])
        
        requires_documents = any(word in query_lower for word in [
            'document', 'policy', 'rule', 'guideline', 'explain', 'definition'
        ])
        
        return {
            'query_type': query_type,
            'data_sources': ['structured_data'] if requires_sql else ['documents'] if requires_documents else ['structured_data'],
            'entities': [],
            'requires_sql': requires_sql,
            'requires_documents': requires_documents,
            'confidence': 0.7
        }
    
    def _gather_context_data(self, query: str, analysis: Dict) -> Dict:
        """
        Gather relevant data based on query analysis
        """
        context_data = {
            'structured_data': {},
            'documents': [],
            'sources': []
        }
        
        try:
            # Gather structured data if needed
            if analysis.get('requires_sql', False) or 'structured_data' in analysis.get('data_sources', []):
                structured_data = self._get_structured_data_context(query, analysis)
                context_data['structured_data'] = structured_data
                if structured_data:
                    context_data['sources'].append('structured_data')
            
            # Gather document data if needed
            if analysis.get('requires_documents', False) or 'documents' in analysis.get('data_sources', []):
                document_data = self._get_document_context(query)
                context_data['documents'] = document_data
                if document_data:
                    context_data['sources'].append('documents')
            
            return context_data
            
        except Exception as e:
            logger.error(f"Error gathering context data: {str(e)}")
            return context_data
    
    def _get_structured_data_context(self, query: str, analysis: Dict) -> Dict:
        """
        Get relevant structured data from SQLite
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get available tables
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%' 
                    AND name != 'ingestion_metadata'
                """)
                tables = [row[0] for row in cursor.fetchall()]
                
                context = {
                    'tables': [],
                    'sample_data': {},
                    'schema_info': {}
                }
                
                # Get schema and sample data for each table
                for table in tables:
                    try:
                        # Get table schema
                        cursor.execute(f"PRAGMA table_info({table})")
                        columns = cursor.fetchall()
                        
                        # Get sample data
                        cursor.execute(f"SELECT * FROM {table} LIMIT 5")
                        sample_rows = cursor.fetchall()
                        
                        # Get basic statistics
                        cursor.execute(f"SELECT COUNT(*) FROM {table}")
                        row_count = cursor.fetchone()[0]
                        
                        table_info = {
                            'name': table,
                            'columns': [{'name': col[1], 'type': col[2]} for col in columns],
                            'row_count': row_count,
                            'sample_data': sample_rows[:3]  # Limit sample data
                        }
                        
                        context['tables'].append(table_info)
                        context['schema_info'][table] = table_info
                        
                    except Exception as e:
                        logger.warning(f"Error getting info for table {table}: {str(e)}")
                        continue
                
                return context
                
        except Exception as e:
            logger.error(f"Error getting structured data context: {str(e)}")
            return {}
    
    def _get_document_context(self, query: str) -> List[Dict]:
        """
        Get relevant documents using simple search
        """
        try:
            # Use document processor to search
            search_results = self.doc_agent.search_documents(query, limit=5)
            
            return [
                {
                    'content': result['content'],
                    'metadata': result['metadata'],
                    'score': 1.0 - result.get('distance', 1.0),  # Convert distance to similarity score
                    'collection': result.get('collection', 'unknown')
                }
                for result in search_results
            ]
            
        except Exception as e:
            logger.error(f"Error getting document context: {str(e)}")
            return []
    
    def _generate_ai_response(self, query: str, context_data: Dict, analysis: Dict) -> str:
        """
        Generate AI response using OpenAI with context data
        """
        try:
            # Build context prompt
            context_prompt = self._build_context_prompt(context_data, analysis)
            
            # Build system prompt
            system_prompt = """
            You are CollectiSense AI, an intelligent assistant for financial transaction analysis.
            You help users analyze their transaction data, understand costs, and optimize their payment processing.
            
            Guidelines:
            1. Provide accurate, data-driven answers based on the provided context
            2. If you need to perform calculations, show your work
            3. If data is insufficient, clearly state what's missing
            4. Use clear, professional language
            5. Format numbers appropriately (currency, percentages, etc.)
            6. If asked about SQL queries, provide the actual SQL when helpful
            
            Available data sources:
            - Structured transaction data (SQLite tables)
            - Document content (policies, rules, guidelines)
            """
            
            # Build user prompt
            user_prompt = f"""
            Query: {query}
            
            Context Data:
            {context_prompt}
            
            Please provide a comprehensive answer based on the available data.
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return f"I apologize, but I encountered an error while processing your query: {str(e)}"
    
    def _build_context_prompt(self, context_data: Dict, analysis: Dict) -> str:
        """
        Build context prompt from gathered data
        """
        context_parts = []
        
        # Add structured data context
        if context_data.get('structured_data') and context_data['structured_data'].get('tables'):
            context_parts.append("STRUCTURED DATA:")
            
            for table_info in context_data['structured_data']['tables']:
                context_parts.append(f"\nTable: {table_info['name']}")
                context_parts.append(f"Rows: {table_info['row_count']}")
                context_parts.append("Columns: " + ", ".join([f"{col['name']} ({col['type']})" for col in table_info['columns']]))
                
                if table_info['sample_data']:
                    context_parts.append("Sample data:")
                    for i, row in enumerate(table_info['sample_data']):
                        context_parts.append(f"  Row {i+1}: {row}")
        
        # Add document context
        if context_data.get('documents'):
            context_parts.append("\nDOCUMENT CONTENT:")
            
            for i, doc in enumerate(context_data['documents'][:3]):  # Limit to top 3
                context_parts.append(f"\nDocument {i+1}:")
                context_parts.append(f"Content: {doc['content'][:500]}...")  # Limit content length
                if doc.get('metadata', {}).get('source'):
                    context_parts.append(f"Source: {doc['metadata']['source']}")
        
        return "\n".join(context_parts)
    
    def _store_query_history(self, query: str, response: str, analysis: Dict):
        """
        Store query history for context in future queries
        """
        try:
            history_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'query': query,
                'response': response[:500],  # Truncate for storage
                'analysis': analysis
            }
            
            self.query_history.append(history_entry)
            
            # Keep only last 10 queries
            if len(self.query_history) > 10:
                self.query_history = self.query_history[-10:]
                
        except Exception as e:
            logger.error(f"Error storing query history: {str(e)}")
    
    def execute_sql_query(self, sql_query: str) -> Dict:
        """
        Execute SQL query safely (for advanced users)
        """
        try:
            # Basic SQL injection protection
            dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE']
            if any(keyword in sql_query.upper() for keyword in dangerous_keywords):
                return {
                    'status': 'error',
                    'error': 'Only SELECT queries are allowed for security reasons'
                }
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(sql_query)
                
                results = cursor.fetchall()
                columns = [description[0] for description in cursor.description]
                
                return {
                    'status': 'success',
                    'columns': columns,
                    'data': results,
                    'row_count': len(results)
                }
                
        except Exception as e:
            logger.error(f"Error executing SQL query: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def get_available_data_summary(self) -> Dict:
        """
        Get summary of available data for the user
        """
        try:
            summary = {
                'structured_data': {},
                'documents': {},
                'total_tables': 0,
                'total_documents': 0
            }
            
            # Get structured data summary
            tables = self.data_agent.list_tables()
            summary['structured_data'] = {
                'tables': tables,
                'count': len(tables)
            }
            summary['total_tables'] = len(tables)
            
            # Get document summary - simplified approach
            try:
                collections = self.doc_agent.chroma_client.list_collections()
                doc_collections = [coll.name for coll in collections]
                total_docs = len(doc_collections)
                
                summary['documents'] = {
                    'collections': doc_collections,
                    'total_chunks': total_docs
                }
                summary['total_documents'] = total_docs
            except Exception as e:
                logger.warning(f"Error getting document summary: {str(e)}")
                summary['documents'] = {'collections': [], 'total_chunks': 0}
                summary['total_documents'] = 0
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting data summary: {str(e)}")
            return {}