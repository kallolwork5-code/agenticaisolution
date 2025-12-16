import pandas as pd
import sqlite3
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataIngestionAgent:
    """
    Agent responsible for ingesting structured data (Excel/CSV) into SQLite database
    with automatic schema creation and duplicate handling
    """
    
    def __init__(self, db_path: str = "prompts.db"):
        self.db_path = db_path
        self.ensure_db_directory()
    
    def ensure_db_directory(self):
        """Ensure the database directory exists"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    
    def ingest_structured_data(self, 
                             file_path: str, 
                             schema: Dict, 
                             table_name: str,
                             file_id: str,
                             content_hash: str,
                             original_filename: str = None) -> Dict:
        """
        Main method to ingest structured data into SQLite
        """
        try:
            # Check for duplicates
            duplicate_info = self._check_duplicate(content_hash, table_name)
            if duplicate_info['is_duplicate']:
                return {
                    'status': 'duplicate',
                    'message': f'File is a duplicate of {duplicate_info["original_file"]}',
                    'records_processed': 0,
                    'table_name': table_name,
                    'duplicate_info': duplicate_info
                }
            
            # Read the data
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            if df.empty:
                return {
                    'status': 'error',
                    'message': 'File is empty',
                    'records_processed': 0
                }
            
            # Clean and prepare data
            df_cleaned = self._clean_dataframe(df, schema)
            
            # Create or update table schema
            table_created = self._create_or_update_table(table_name, schema, df_cleaned)
            
            # Insert data
            records_inserted = self._insert_data(df_cleaned, table_name, file_id, content_hash)
            
            # Update metadata
            self._update_ingestion_metadata(file_id, table_name, records_inserted, content_hash, original_filename)
            
            return {
                'status': 'success',
                'message': f'Successfully ingested {records_inserted} records',
                'records_processed': records_inserted,
                'table_name': table_name,
                'table_created': table_created,
                'schema_applied': schema
            }
            
        except Exception as e:
            logger.error(f"Error ingesting data: {str(e)}")
            return {
                'status': 'error',
                'message': f'Ingestion failed: {str(e)}',
                'records_processed': 0
            }
    
    def _check_duplicate(self, content_hash: str, table_name: str) -> Dict:
        """Check if file content already exists"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check in metadata table
                cursor.execute("""
                    SELECT file_id, original_filename, ingested_at 
                    FROM ingestion_metadata 
                    WHERE content_hash = ? AND table_name = ?
                """, (content_hash, table_name))
                
                result = cursor.fetchone()
                if result:
                    original_filename = result[1] or f"file_{result[0][:8]}"  # Fallback if filename is None
                    return {
                        'is_duplicate': True,
                        'original_file_id': result[0],
                        'original_file': original_filename,
                        'ingested_at': result[2]
                    }
                
                return {'is_duplicate': False}
                
        except sqlite3.Error as e:
            logger.error(f"Error checking duplicates: {str(e)}")
            return {'is_duplicate': False}
    
    def _clean_dataframe(self, df: pd.DataFrame, schema: Dict) -> pd.DataFrame:
        """Clean and prepare dataframe for ingestion"""
        df_cleaned = df.copy()
        
        # Remove completely empty rows
        df_cleaned = df_cleaned.dropna(how='all')
        
        # Clean column names
        df_cleaned.columns = [self._clean_column_name(col) for col in df_cleaned.columns]
        
        # Apply data type conversions based on schema
        for col, col_info in schema['columns'].items():
            clean_col = self._clean_column_name(col)
            if clean_col in df_cleaned.columns:
                df_cleaned[clean_col] = self._convert_column_type(
                    df_cleaned[clean_col], col_info['type']
                )
        
        # Add metadata columns
        df_cleaned['_file_id'] = None  # Will be filled during insert
        df_cleaned['_ingested_at'] = datetime.utcnow().isoformat()
        df_cleaned['_row_hash'] = df_cleaned.apply(
            lambda row: hash(str(row.values)), axis=1
        )
        
        return df_cleaned
    
    def _clean_column_name(self, col_name: str) -> str:
        """Clean column name for SQL compatibility"""
        import re
        # Replace spaces and special characters with underscores
        clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', str(col_name))
        # Remove multiple underscores
        clean_name = re.sub(r'_+', '_', clean_name)
        # Remove leading/trailing underscores
        clean_name = clean_name.strip('_')
        # Ensure it doesn't start with a number
        if clean_name and clean_name[0].isdigit():
            clean_name = f"col_{clean_name}"
        return clean_name.lower()
    
    def _convert_column_type(self, series: pd.Series, sql_type: str) -> pd.Series:
        """Convert pandas series to appropriate type"""
        try:
            if sql_type == 'INTEGER':
                return pd.to_numeric(series, errors='coerce').astype('Int64')
            elif sql_type == 'REAL':
                return pd.to_numeric(series, errors='coerce')
            elif sql_type == 'DATETIME':
                import warnings
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    return pd.to_datetime(series, errors='coerce')
            else:  # TEXT
                return series.astype(str)
        except Exception as e:
            logger.warning(f"Error converting column type: {str(e)}")
            return series
    
    def _create_or_update_table(self, table_name: str, schema: Dict, df: pd.DataFrame) -> bool:
        """Create table or update schema if needed"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check if table exists
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name=?
                """, (table_name,))
                
                table_exists = cursor.fetchone() is not None
                
                if not table_exists:
                    # Create new table
                    self._create_table(cursor, table_name, schema, df)
                    self._create_metadata_table(cursor)
                    return True
                else:
                    # Check if schema update is needed
                    self._update_table_schema(cursor, table_name, schema, df)
                    return False
                    
        except sqlite3.Error as e:
            logger.error(f"Error creating/updating table: {str(e)}")
            raise
    
    def _create_table(self, cursor: sqlite3.Cursor, table_name: str, schema: Dict, df: pd.DataFrame):
        """Create a new table with the given schema"""
        columns_sql = []
        
        # Add data columns
        for col in df.columns:
            if col.startswith('_'):
                continue  # Skip metadata columns for now
            
            # Find matching schema column
            sql_type = 'TEXT'  # Default
            for schema_col, col_info in schema['columns'].items():
                if self._clean_column_name(schema_col) == col:
                    sql_type = col_info['type']
                    break
            
            columns_sql.append(f"{col} {sql_type}")
        
        # Add metadata columns
        columns_sql.extend([
            "_file_id TEXT",
            "_ingested_at TEXT",
            "_row_hash INTEGER"
        ])
        
        create_sql = f"""
            CREATE TABLE {table_name} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                {', '.join(columns_sql)}
            )
        """
        
        cursor.execute(create_sql)
        
        # Create indexes
        for index_col in schema.get('indexes', []):
            clean_col = self._clean_column_name(index_col)
            if clean_col in [col.split()[0] for col in columns_sql]:
                cursor.execute(f"CREATE INDEX idx_{table_name}_{clean_col} ON {table_name}({clean_col})")
    
    def _create_metadata_table(self, cursor: sqlite3.Cursor):
        """Create metadata table for tracking ingestions"""
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ingestion_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id TEXT NOT NULL,
                table_name TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                original_filename TEXT,
                records_count INTEGER,
                ingested_at TEXT,
                schema_version INTEGER DEFAULT 1,
                UNIQUE(content_hash, table_name)
            )
        """)
    
    def _update_table_schema(self, cursor: sqlite3.Cursor, table_name: str, schema: Dict, df: pd.DataFrame):
        """Update table schema if new columns are detected"""
        # Get existing columns
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_cols = {row[1] for row in cursor.fetchall()}
        
        # Add new columns if any
        for col in df.columns:
            if col not in existing_cols and not col.startswith('_'):
                # Find SQL type from schema
                sql_type = 'TEXT'
                for schema_col, col_info in schema['columns'].items():
                    if self._clean_column_name(schema_col) == col:
                        sql_type = col_info['type']
                        break
                
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {col} {sql_type}")
                logger.info(f"Added new column {col} to table {table_name}")
    
    def _insert_data(self, df: pd.DataFrame, table_name: str, file_id: str, content_hash: str) -> int:
        """Insert data into the table"""
        try:
            # Set file_id for all rows
            df['_file_id'] = file_id
            
            with sqlite3.connect(self.db_path) as conn:
                # Insert data
                records_inserted = df.to_sql(
                    table_name, 
                    conn, 
                    if_exists='append', 
                    index=False,
                    method='multi'
                )
                
                return len(df)
                
        except Exception as e:
            logger.error(f"Error inserting data: {str(e)}")
            raise
    
    def _update_ingestion_metadata(self, file_id: str, table_name: str, records_count: int, content_hash: str, original_filename: str = None):
        """Update ingestion metadata"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO ingestion_metadata 
                    (file_id, table_name, content_hash, original_filename, records_count, ingested_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (file_id, table_name, content_hash, original_filename, records_count, datetime.utcnow().isoformat()))
                
        except sqlite3.Error as e:
            logger.error(f"Error updating metadata: {str(e)}")
    
    def get_table_info(self, table_name: str) -> Dict:
        """Get information about a table"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get table schema
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                row_count = cursor.fetchone()[0]
                
                # Get recent ingestions
                cursor.execute("""
                    SELECT file_id, records_count, ingested_at 
                    FROM ingestion_metadata 
                    WHERE table_name = ? 
                    ORDER BY ingested_at DESC 
                    LIMIT 5
                """, (table_name,))
                recent_ingestions = cursor.fetchall()
                
                return {
                    'table_name': table_name,
                    'columns': [{'name': col[1], 'type': col[2]} for col in columns],
                    'row_count': row_count,
                    'recent_ingestions': recent_ingestions
                }
                
        except sqlite3.Error as e:
            logger.error(f"Error getting table info: {str(e)}")
            return {'error': str(e)}
    
    def list_tables(self) -> List[Dict]:
        """List all data tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%' 
                    AND name != 'ingestion_metadata'
                """)
                
                tables = []
                for (table_name,) in cursor.fetchall():
                    table_info = self.get_table_info(table_name)
                    tables.append(table_info)
                
                return tables
                
        except sqlite3.Error as e:
            logger.error(f"Error listing tables: {str(e)}")
            return []
    
    def delete_table_data(self, table_name: str, file_id: str) -> bool:
        """Delete data from a table for a specific file"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Delete data rows for this file
                cursor.execute(f"DELETE FROM {table_name} WHERE _file_id = ?", (file_id,))
                deleted_rows = cursor.rowcount
                
                # Delete metadata entry
                cursor.execute("DELETE FROM ingestion_metadata WHERE file_id = ?", (file_id,))
                
                logger.info(f"Deleted {deleted_rows} rows from {table_name} for file {file_id}")
                return True
                
        except sqlite3.Error as e:
            logger.error(f"Error deleting table data: {str(e)}")
            return False
    
    def get_table_data(self, table_name: str, limit: int = 100, offset: int = 0) -> Dict:
        """Get data from a table with pagination"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get column names
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = [col[1] for col in cursor.fetchall()]
                
                # Get data with pagination
                cursor.execute(f"SELECT * FROM {table_name} LIMIT ? OFFSET ?", (limit, offset))
                rows = cursor.fetchall()
                
                # Convert to list of dictionaries
                data = []
                for row in rows:
                    data.append(dict(zip(columns, row)))
                
                return {
                    'data': data,
                    'columns': columns,
                    'returned_rows': len(data)
                }
                
        except sqlite3.Error as e:
            logger.error(f"Error getting table data: {str(e)}")
            return {'error': str(e), 'data': [], 'columns': []}