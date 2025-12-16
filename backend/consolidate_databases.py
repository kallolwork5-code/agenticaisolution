#!/usr/bin/env python3
"""
Database Consolidation Script for CollectiSense AI

This script consolidates multiple SQLite database files into a single database,
eliminating duplicates and ensuring data integrity.
"""

import os
import sqlite3
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import argparse


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('database_consolidation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class TableInfo:
    """Information about a database table"""
    name: str
    columns: List[str]
    row_count: int
    schema: str


@dataclass
class DatabaseInfo:
    """Information about a database file"""
    path: str
    size: int
    tables: List[TableInfo]
    created_at: datetime
    last_modified: datetime


class DatabaseAnalyzer:
    """Analyzes database files and their schemas"""
    
    def scan_database_files(self, directory: str = ".", recursive: bool = False) -> List[str]:
        """Scan directory for SQLite database files"""
        db_files = []
        
        if recursive:
            # Recursively scan subdirectories
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.db'):
                        db_path = os.path.join(root, file)
                        if os.path.isfile(db_path) and self._is_sqlite_database(db_path):
                            db_files.append(db_path)
        else:
            # Scan only current directory
            for file in os.listdir(directory):
                if file.endswith('.db'):
                    db_path = os.path.join(directory, file)
                    if os.path.isfile(db_path) and self._is_sqlite_database(db_path):
                        db_files.append(db_path)
        
        # Sort by file size (largest first) for better processing order
        db_files.sort(key=lambda x: os.path.getsize(x), reverse=True)
        
        logger.info(f"Found {len(db_files)} database files: {db_files}")
        return db_files
    
    def _is_sqlite_database(self, file_path: str) -> bool:
        """Verify that a file is actually a SQLite database"""
        try:
            conn = sqlite3.connect(file_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;")
            conn.close()
            return True
        except sqlite3.Error:
            logger.warning(f"File {file_path} is not a valid SQLite database")
            return False
        except Exception as e:
            logger.warning(f"Could not verify {file_path}: {e}")
            return False
    
    def analyze_database(self, db_path: str) -> DatabaseInfo:
        """Analyze a single database file"""
        logger.info(f"Analyzing database: {db_path}")
        
        try:
            # Get file stats
            stat = os.stat(db_path)
            size = stat.st_size
            created_at = datetime.fromtimestamp(stat.st_ctime)
            last_modified = datetime.fromtimestamp(stat.st_mtime)
            
            # Connect and analyze schema
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get all tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            table_names = [row[0] for row in cursor.fetchall()]
            
            tables = []
            for table_name in table_names:
                # Get table schema
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = [col[1] for col in cursor.fetchall()]
                
                # Get row count
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                row_count = cursor.fetchone()[0]
                
                # Get CREATE statement
                cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
                schema_result = cursor.fetchone()
                schema = schema_result[0] if schema_result else ""
                
                tables.append(TableInfo(
                    name=table_name,
                    columns=columns,
                    row_count=row_count,
                    schema=schema
                ))
            
            conn.close()
            
            return DatabaseInfo(
                path=db_path,
                size=size,
                tables=tables,
                created_at=created_at,
                last_modified=last_modified
            )
            
        except Exception as e:
            logger.error(f"Error analyzing database {db_path}: {e}")
            raise
    
    def print_database_summary(self, db_info: DatabaseInfo):
        """Print a summary of database information"""
        print(f"\n📊 Database: {db_info.path}")
        print(f"   Size: {db_info.size:,} bytes")
        print(f"   Created: {db_info.created_at}")
        print(f"   Modified: {db_info.last_modified}")
        print(f"   Tables: {len(db_info.tables)}")
        
        for table in db_info.tables:
            print(f"     - {table.name}: {table.row_count} rows, {len(table.columns)} columns")
    
    def compare_schemas(self, db_infos: List[DatabaseInfo]) -> Dict[str, Dict]:
        """Compare schemas across multiple databases to identify conflicts"""
        logger.info("Comparing schemas across databases...")
        
        # Group tables by name across all databases
        table_schemas = {}
        
        for db_info in db_infos:
            for table in db_info.tables:
                if table.name not in table_schemas:
                    table_schemas[table.name] = {}
                
                table_schemas[table.name][db_info.path] = {
                    'columns': table.columns,
                    'schema': table.schema,
                    'row_count': table.row_count
                }
        
        # Identify conflicts
        conflicts = {}
        for table_name, db_schemas in table_schemas.items():
            if len(db_schemas) > 1:
                # Check if schemas are identical
                schemas = list(db_schemas.values())
                first_schema = schemas[0]['schema']
                first_columns = schemas[0]['columns']
                
                schema_conflicts = []
                for db_path, schema_info in db_schemas.items():
                    if (schema_info['schema'] != first_schema or 
                        schema_info['columns'] != first_columns):
                        schema_conflicts.append({
                            'database': db_path,
                            'columns': schema_info['columns'],
                            'schema': schema_info['schema']
                        })
                
                if schema_conflicts:
                    conflicts[table_name] = {
                        'type': 'schema_mismatch',
                        'conflicts': schema_conflicts,
                        'databases': list(db_schemas.keys())
                    }
        
        return conflicts
    
    def print_schema_conflicts(self, conflicts: Dict[str, Dict]):
        """Print schema conflicts in a readable format"""
        if not conflicts:
            print("\n✅ No schema conflicts detected")
            return
        
        print(f"\n⚠️  Schema Conflicts Detected ({len(conflicts)} tables):")
        for table_name, conflict_info in conflicts.items():
            print(f"\n   Table: {table_name}")
            print(f"   Databases: {', '.join(conflict_info['databases'])}")
            
            if conflict_info['type'] == 'schema_mismatch':
                print("   Issue: Different column structures")
                for conflict in conflict_info['conflicts']:
                    print(f"     - {conflict['database']}: {len(conflict['columns'])} columns")
    
    def get_database_statistics(self, db_infos: List[DatabaseInfo]) -> Dict:
        """Generate comprehensive statistics about all databases"""
        stats = {
            'total_databases': len(db_infos),
            'total_size': sum(db.size for db in db_infos),
            'total_tables': sum(len(db.tables) for db in db_infos),
            'total_rows': sum(sum(table.row_count for table in db.tables) for db in db_infos),
            'unique_tables': set(),
            'duplicate_tables': {},
            'largest_database': None,
            'most_recent': None
        }
        
        # Find unique and duplicate tables
        table_counts = {}
        for db_info in db_infos:
            for table in db_info.tables:
                stats['unique_tables'].add(table.name)
                table_counts[table.name] = table_counts.get(table.name, 0) + 1
        
        stats['duplicate_tables'] = {name: count for name, count in table_counts.items() if count > 1}
        stats['unique_tables'] = len(stats['unique_tables'])
        
        # Find largest and most recent database
        if db_infos:
            stats['largest_database'] = max(db_infos, key=lambda x: x.size)
            stats['most_recent'] = max(db_infos, key=lambda x: x.last_modified)
        
        return stats
    
    def print_consolidation_plan(self, db_infos: List[DatabaseInfo], target_db: str):
        """Print a detailed consolidation plan"""
        stats = self.get_database_statistics(db_infos)
        conflicts = self.compare_schemas(db_infos)
        
        print(f"\n📋 Consolidation Plan")
        print("=" * 30)
        print(f"Target Database: {target_db}")
        print(f"Source Databases: {stats['total_databases']}")
        print(f"Total Size: {stats['total_size']:,} bytes")
        print(f"Unique Tables: {stats['unique_tables']}")
        print(f"Total Rows: {stats['total_rows']:,}")
        
        if stats['duplicate_tables']:
            print(f"\n📊 Tables in Multiple Databases:")
            for table_name, count in stats['duplicate_tables'].items():
                print(f"   - {table_name}: appears in {count} databases")
        
        self.print_schema_conflicts(conflicts)
        
        if conflicts:
            print(f"\n⚠️  Warning: Schema conflicts detected!")
            print("   The consolidation will use INSERT OR REPLACE to handle conflicts.")
            print("   Review the conflicts above before proceeding.")


class DatabaseConsolidator:
    """Handles database consolidation operations"""
    
    def __init__(self, target_db: str = "collectisense.db"):
        self.target_db = target_db
        self.backup_dir = f"db_backups_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def create_backups(self, db_files: List[str]) -> str:
        """Create backups of all database files"""
        logger.info(f"Creating backups in {self.backup_dir}")
        
        os.makedirs(self.backup_dir, exist_ok=True)
        
        for db_file in db_files:
            backup_path = os.path.join(self.backup_dir, os.path.basename(db_file))
            shutil.copy2(db_file, backup_path)
            logger.info(f"Backed up {db_file} to {backup_path}")
        
        return self.backup_dir
    
    def ensure_target_database(self) -> None:
        """Ensure target database exists with proper schema"""
        if not os.path.exists(self.target_db):
            logger.info(f"Creating new target database: {self.target_db}")
            # Import and create tables using SQLAlchemy
            try:
                import sys
                sys.path.append('.')
                from app.db.database import engine
                from app.db import models
                
                # Create all tables
                models.Base.metadata.create_all(bind=engine)
                logger.info("Created database schema using SQLAlchemy models")
                
            except Exception as e:
                logger.warning(f"Could not create schema with SQLAlchemy: {e}")
                # Create basic database
                conn = sqlite3.connect(self.target_db)
                conn.close()
                logger.info("Created empty database file")
    
    def migrate_table_data(self, source_db: str, target_db: str, table_name: str) -> int:
        """Migrate data from source table to target table"""
        logger.info(f"Migrating table '{table_name}' from {source_db} to {target_db}")
        
        source_conn = sqlite3.connect(source_db)
        target_conn = sqlite3.connect(target_db)
        
        try:
            # Get source data
            source_cursor = source_conn.cursor()
            source_cursor.execute(f"SELECT * FROM {table_name}")
            rows = source_cursor.fetchall()
            
            if not rows:
                logger.info(f"No data to migrate for table '{table_name}'")
                return 0
            
            # Get column names
            source_cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in source_cursor.fetchall()]
            
            # Check if target table exists
            target_cursor = target_conn.cursor()
            target_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            
            if not target_cursor.fetchone():
                # Create table in target database
                source_cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
                create_sql = source_cursor.fetchone()[0]
                target_cursor.execute(create_sql)
                logger.info(f"Created table '{table_name}' in target database")
            
            # Insert data with conflict resolution
            placeholders = ','.join(['?' for _ in columns])
            insert_sql = f"INSERT OR REPLACE INTO {table_name} VALUES ({placeholders})"
            
            migrated_count = 0
            for row in rows:
                try:
                    target_cursor.execute(insert_sql, row)
                    migrated_count += 1
                except Exception as e:
                    logger.warning(f"Failed to insert row in {table_name}: {e}")
            
            target_conn.commit()
            logger.info(f"Migrated {migrated_count} rows to table '{table_name}'")
            return migrated_count
            
        except Exception as e:
            logger.error(f"Error migrating table {table_name}: {e}")
            target_conn.rollback()
            raise
        finally:
            source_conn.close()
            target_conn.close()
    
    def consolidate_databases(self, db_files: List[str]) -> Dict[str, int]:
        """Consolidate multiple databases into target database"""
        logger.info(f"Starting consolidation into {self.target_db}")
        
        # Ensure target database exists
        self.ensure_target_database()
        
        migration_stats = {}
        analyzer = DatabaseAnalyzer()
        
        for db_file in db_files:
            if db_file == self.target_db:
                logger.info(f"Skipping target database: {db_file}")
                continue
            
            logger.info(f"Processing database: {db_file}")
            db_info = analyzer.analyze_database(db_file)
            
            file_stats = {"tables": 0, "rows": 0}
            
            for table in db_info.tables:
                if table.row_count > 0:
                    migrated_rows = self.migrate_table_data(db_file, self.target_db, table.name)
                    file_stats["tables"] += 1
                    file_stats["rows"] += migrated_rows
            
            migration_stats[db_file] = file_stats
            logger.info(f"Completed migration from {db_file}: {file_stats}")
        
        return migration_stats
    
    def verify_consolidation(self, original_stats: Dict[str, DatabaseInfo]) -> bool:
        """Verify that consolidation was successful"""
        logger.info("Verifying consolidation results...")
        
        analyzer = DatabaseAnalyzer()
        target_info = analyzer.analyze_database(self.target_db)
        
        # Count total expected rows per table
        expected_rows = {}
        for db_path, db_info in original_stats.items():
            if db_path == self.target_db:
                continue
            for table in db_info.tables:
                expected_rows[table.name] = expected_rows.get(table.name, 0) + table.row_count
        
        # Verify target database has expected data
        verification_passed = True
        for table in target_info.tables:
            expected = expected_rows.get(table.name, 0)
            actual = table.row_count
            
            if expected > 0 and actual < expected:
                logger.warning(f"Table {table.name}: expected at least {expected} rows, found {actual}")
                verification_passed = False
            else:
                logger.info(f"Table {table.name}: {actual} rows (expected >= {expected}) ✓")
        
        return verification_passed
    
    def cleanup_old_databases(self, db_files: List[str], confirm: bool = True) -> None:
        """Remove old database files after successful consolidation"""
        files_to_remove = [f for f in db_files if f != self.target_db]
        
        if not files_to_remove:
            logger.info("No files to clean up")
            return
        
        if confirm:
            print(f"\n🗑️  Files to be removed:")
            for file in files_to_remove:
                print(f"   - {file}")
            
            response = input("\nProceed with cleanup? (yes/no): ").lower().strip()
            if response != 'yes':
                logger.info("Cleanup cancelled by user")
                return
        
        for file in files_to_remove:
            try:
                os.remove(file)
                logger.info(f"Removed {file}")
            except Exception as e:
                logger.error(f"Failed to remove {file}: {e}")


def main():
    """Main consolidation workflow"""
    parser = argparse.ArgumentParser(description="Consolidate SQLite databases")
    parser.add_argument("--target", default="collectisense.db", help="Target database file")
    parser.add_argument("--directory", default=".", help="Directory to scan for databases")
    parser.add_argument("--analyze-only", action="store_true", help="Only analyze, don't consolidate")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup creation")
    parser.add_argument("--auto-cleanup", action="store_true", help="Automatically cleanup old files")
    
    args = parser.parse_args()
    
    print("🔍 CollectiSense Database Consolidation Tool")
    print("=" * 50)
    
    # Initialize components
    analyzer = DatabaseAnalyzer()
    consolidator = DatabaseConsolidator(args.target)
    
    # Scan for databases
    db_files = analyzer.scan_database_files(args.directory)
    
    if not db_files:
        print("No database files found!")
        return
    
    # Analyze all databases
    print("\n📊 Analyzing databases...")
    original_stats = {}
    db_infos = []
    for db_file in db_files:
        try:
            db_info = analyzer.analyze_database(db_file)
            original_stats[db_file] = db_info
            db_infos.append(db_info)
            analyzer.print_database_summary(db_info)
        except Exception as e:
            logger.error(f"Failed to analyze {db_file}: {e}")
    
    # Show consolidation plan
    if len(db_infos) > 1:
        analyzer.print_consolidation_plan(db_infos, args.target)
    
    if args.analyze_only:
        print("\n✅ Analysis complete (analyze-only mode)")
        return
    
    # Create backups
    if not args.no_backup:
        backup_dir = consolidator.create_backups(db_files)
        print(f"\n💾 Backups created in: {backup_dir}")
    
    # Consolidate databases
    print(f"\n🔄 Consolidating databases into {args.target}...")
    try:
        migration_stats = consolidator.consolidate_databases(db_files)
        
        print("\n📈 Migration Summary:")
        total_tables = 0
        total_rows = 0
        for db_file, stats in migration_stats.items():
            print(f"   {db_file}: {stats['tables']} tables, {stats['rows']} rows")
            total_tables += stats['tables']
            total_rows += stats['rows']
        
        print(f"\n   Total: {total_tables} tables, {total_rows} rows migrated")
        
        # Verify consolidation
        if consolidator.verify_consolidation(original_stats):
            print("\n✅ Consolidation verification passed!")
            
            # Cleanup old files
            consolidator.cleanup_old_databases(db_files, not args.auto_cleanup)
            
            print(f"\n🎉 Database consolidation complete!")
            print(f"   All data is now in: {args.target}")
            
        else:
            print("\n❌ Consolidation verification failed!")
            print("   Please check the logs and verify data manually")
            
    except Exception as e:
        logger.error(f"Consolidation failed: {e}")
        print(f"\n❌ Consolidation failed: {e}")
        if not args.no_backup:
            print(f"   Backups are available in: {backup_dir}")


if __name__ == "__main__":
    main()