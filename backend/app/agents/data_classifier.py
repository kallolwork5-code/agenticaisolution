import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import re
from pathlib import Path
import hashlib
import json

class DataClassificationAgent:
    """
    Agent responsible for classifying uploaded data files into:
    - Reference Data: Master data, lookup tables, configuration data
    - Transaction Data: Actual transaction records, payment data
    - Document Data: PDF, Word documents for RAG processing
    """
    
    def __init__(self):
        # Keywords for reference data identification
        self.reference_keywords = [
            'rate', 'card', 'routing', 'rule', 'config', 'master', 'lookup',
            'merchant', 'acquirer', 'network', 'bin', 'mcc', 'currency',
            'country', 'region', 'fee', 'commission', 'tier', 'category'
        ]
        
        # Keywords for transaction data identification
        self.transaction_keywords = [
            'transaction', 'payment', 'settlement', 'auth', 'capture',
            'refund', 'chargeback', 'amount', 'timestamp', 'date',
            'txn', 'trx', 'pan', 'card_number', 'merchant_id', 'terminal'
        ]
        
        # Common column patterns
        self.reference_patterns = [
            r'.*rate.*', r'.*config.*', r'.*rule.*', r'.*master.*',
            r'.*lookup.*', r'.*ref.*', r'.*code.*', r'.*type.*'
        ]
        
        self.transaction_patterns = [
            r'.*amount.*', r'.*date.*', r'.*time.*', r'.*txn.*',
            r'.*transaction.*', r'.*payment.*', r'.*id.*', r'.*number.*'
        ]
    
    def classify_file(self, file_path: str, file_name: str, file_type: str) -> Dict:
        """
        Main classification method that determines data type and extracts schema
        """
        try:
            # Calculate content hash for duplicate detection
            content_hash = self._calculate_file_hash(file_path)
            
            # Handle different file types
            if file_type in ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'application/vnd.ms-excel', 'text/csv']:
                return self._classify_structured_data(file_path, file_name, content_hash)
            
            elif file_type in ['application/pdf', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'application/msword']:
                return self._classify_document_data(file_path, file_name, content_hash)
            
            else:
                return {
                    'data_type': 'unknown',
                    'confidence': 0.0,
                    'schema': None,
                    'content_hash': content_hash,
                    'error': f'Unsupported file type: {file_type}'
                }
                
        except Exception as e:
            return {
                'data_type': 'error',
                'confidence': 0.0,
                'schema': None,
                'content_hash': None,
                'error': str(e)
            }
    
    def _classify_structured_data(self, file_path: str, file_name: str, content_hash: str) -> Dict:
        """
        Classify Excel/CSV files as reference or transaction data
        """
        try:
            # Read the file
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path, nrows=1000)  # Sample first 1000 rows
            else:
                df = pd.read_excel(file_path, nrows=1000)
            
            if df.empty:
                return {
                    'data_type': 'empty',
                    'confidence': 1.0,
                    'schema': None,
                    'content_hash': content_hash,
                    'error': 'File is empty'
                }
            
            # Analyze columns and content
            columns = [col.lower().strip() for col in df.columns]
            
            # Score based on filename
            filename_score = self._score_filename(file_name.lower())
            
            # Score based on column names
            column_score = self._score_columns(columns)
            
            # Score based on data patterns
            data_score = self._score_data_patterns(df)
            
            # Combine scores
            reference_score = (
                filename_score['reference'] * 0.3 +
                column_score['reference'] * 0.4 +
                data_score['reference'] * 0.3
            )
            
            transaction_score = (
                filename_score['transaction'] * 0.3 +
                column_score['transaction'] * 0.4 +
                data_score['transaction'] * 0.3
            )
            
            # Determine classification
            if reference_score > transaction_score and reference_score > 0.6:
                data_type = 'reference'
                confidence = reference_score
            elif transaction_score > 0.6:
                data_type = 'transaction'
                confidence = transaction_score
            else:
                # Default to transaction if unclear
                data_type = 'transaction'
                confidence = max(reference_score, transaction_score, 0.5)
            
            # Generate schema
            schema = self._generate_schema(df, data_type)
            
            return {
                'data_type': data_type,
                'confidence': confidence,
                'schema': schema,
                'content_hash': content_hash,
                'row_count': len(df),
                'column_count': len(df.columns),
                'sample_data': df.head(3).to_dict('records')
            }
            
        except Exception as e:
            return {
                'data_type': 'error',
                'confidence': 0.0,
                'schema': None,
                'content_hash': content_hash,
                'error': f'Error processing structured data: {str(e)}'
            }
    
    def _classify_document_data(self, file_path: str, file_name: str, content_hash: str) -> Dict:
        """
        Classify PDF/Word documents for RAG processing
        """
        return {
            'data_type': 'document',
            'confidence': 1.0,
            'schema': {
                'type': 'document',
                'processing_method': 'rag',
                'chunking_strategy': 'semantic',
                'embedding_model': 'sentence-transformers'
            },
            'content_hash': content_hash,
            'file_size': Path(file_path).stat().st_size
        }
    
    def _score_filename(self, filename: str) -> Dict[str, float]:
        """Score filename for data type indicators"""
        reference_score = 0.0
        transaction_score = 0.0
        
        for keyword in self.reference_keywords:
            if keyword in filename:
                reference_score += 1.0
        
        for keyword in self.transaction_keywords:
            if keyword in filename:
                transaction_score += 1.0
        
        # Normalize scores
        total_ref_keywords = len(self.reference_keywords)
        total_txn_keywords = len(self.transaction_keywords)
        
        return {
            'reference': min(reference_score / total_ref_keywords, 1.0),
            'transaction': min(transaction_score / total_txn_keywords, 1.0)
        }
    
    def _score_columns(self, columns: List[str]) -> Dict[str, float]:
        """Score column names for data type indicators"""
        reference_score = 0.0
        transaction_score = 0.0
        
        for col in columns:
            # Check reference patterns
            for pattern in self.reference_patterns:
                if re.match(pattern, col):
                    reference_score += 1.0
                    break
            
            # Check transaction patterns
            for pattern in self.transaction_patterns:
                if re.match(pattern, col):
                    transaction_score += 1.0
                    break
        
        total_cols = len(columns)
        if total_cols == 0:
            return {'reference': 0.0, 'transaction': 0.0}
        
        return {
            'reference': reference_score / total_cols,
            'transaction': transaction_score / total_cols
        }
    
    def _score_data_patterns(self, df: pd.DataFrame) -> Dict[str, float]:
        """Score data patterns for type classification"""
        reference_score = 0.0
        transaction_score = 0.0
        
        # Check for typical reference data patterns
        for col in df.columns:
            col_data = df[col].dropna()
            if len(col_data) == 0:
                continue
            
            # Reference data typically has fewer unique values (lookup tables)
            unique_ratio = len(col_data.unique()) / len(col_data)
            if unique_ratio < 0.1:  # Less than 10% unique values
                reference_score += 0.5
            
            # Transaction data typically has more unique values and timestamps
            if unique_ratio > 0.8:  # More than 80% unique values
                transaction_score += 0.5
            
            # Check for amount-like columns
            if col_data.dtype in ['float64', 'int64']:
                col_name = col.lower()
                if any(keyword in col_name for keyword in ['amount', 'value', 'price', 'cost']):
                    transaction_score += 1.0
        
        total_cols = len(df.columns)
        if total_cols == 0:
            return {'reference': 0.0, 'transaction': 0.0}
        
        return {
            'reference': min(reference_score / total_cols, 1.0),
            'transaction': min(transaction_score / total_cols, 1.0)
        }
    
    def _generate_schema(self, df: pd.DataFrame, data_type: str) -> Dict:
        """Generate schema definition for the dataframe"""
        schema = {
            'type': data_type,
            'columns': {},
            'constraints': {},
            'indexes': []
        }
        
        for col in df.columns:
            col_data = df[col].dropna()
            
            # Determine data type
            if col_data.dtype == 'object':
                # Check if it's a date by trying to convert and seeing if we get valid dates
                try:
                    import warnings
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        converted = pd.to_datetime(col_data.head(10), errors='coerce')
                        # Check if at least 50% of values were successfully converted to dates
                        valid_dates = converted.notna().sum()
                        if valid_dates >= len(converted) * 0.5:
                            sql_type = 'DATETIME'
                        else:
                            sql_type = 'TEXT'
                except:
                    sql_type = 'TEXT'
            elif col_data.dtype in ['int64', 'int32']:
                sql_type = 'INTEGER'
            elif col_data.dtype in ['float64', 'float32']:
                sql_type = 'REAL'
            else:
                sql_type = 'TEXT'
            
            schema['columns'][col] = {
                'type': sql_type,
                'nullable': col_data.isnull().any(),
                'unique_values': len(col_data.unique()),
                'sample_values': col_data.head(5).tolist()
            }
            
            # Add indexes for common lookup columns
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in ['id', 'code', 'key', 'number']):
                schema['indexes'].append(col)
        
        return schema
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file content for duplicate detection"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def suggest_table_name(self, file_name: str, data_type: str) -> str:
        """Suggest a table name based on file name and data type"""
        # Clean filename
        base_name = Path(file_name).stem
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', base_name.lower())
        clean_name = re.sub(r'_+', '_', clean_name).strip('_')
        
        # Add prefix based on data type
        if data_type == 'reference':
            prefix = 'ref_'
        elif data_type == 'transaction':
            prefix = 'txn_'
        else:
            prefix = 'data_'
        
        return f"{prefix}{clean_name}"