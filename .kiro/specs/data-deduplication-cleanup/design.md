# Single Database Consolidation Design

## Overview

This design outlines the consolidation of multiple database files into a single `collectisense.db` file. The solution will safely migrate all existing data, update application configuration, and ensure the system uses only one database going forward.

## Architecture

### Current State Analysis
- **collectisense.db**: Main application database (likely contains user data)
- **prompts.db**: Contains AI prompts and templates
- **test_models.db**: Test database for model testing
- **test.db**: General test database

### Target State
- **collectisense.db**: Single unified database containing all application data
- All other .db files removed after successful migration
- Application configured to use only collectisense.db

## Components and Interfaces

### 1. Database Analysis Component

**Purpose**: Analyze existing database files and their schemas

**Interface**:
```python
class DatabaseAnalyzer:
    def scan_database_files(self, directory: str) -> List[DatabaseInfo]
    def analyze_schema(self, db_path: str) -> SchemaInfo
    def check_data_conflicts(self, databases: List[DatabaseInfo]) -> ConflictReport
```

**Responsibilities**:
- Scan backend directory for .db files
- Extract schema information from each database
- Identify table structures and relationships
- Detect potential data conflicts

### 2. Data Migration Component

**Purpose**: Safely migrate data from multiple databases to the target database

**Interface**:
```python
class DataMigrator:
    def create_backup(self, db_path: str) -> str
    def migrate_tables(self, source_db: str, target_db: str) -> MigrationResult
    def handle_conflicts(self, conflicts: ConflictReport) -> ResolutionPlan
    def verify_migration(self, source_db: str, target_db: str) -> VerificationResult
```

**Responsibilities**:
- Create backups before migration
- Copy tables and data between databases
- Handle duplicate records and conflicts
- Verify data integrity after migration

### 3. Configuration Updater Component

**Purpose**: Update application configuration to use single database

**Interface**:
```python
class ConfigurationUpdater:
    def update_database_config(self, db_path: str) -> None
    def update_environment_files(self, db_path: str) -> None
    def validate_configuration(self) -> ValidationResult
```

**Responsibilities**:
- Update database connection strings
- Modify environment variables
- Ensure all components use the same database

### 4. Cleanup Manager Component

**Purpose**: Safely remove redundant database files after successful migration

**Interface**:
```python
class CleanupManager:
    def remove_old_databases(self, keep_db: str, backup_dir: str) -> None
    def verify_single_database(self) -> bool
    def rollback_if_needed(self, backup_dir: str) -> None
```

**Responsibilities**:
- Remove old database files after verification
- Maintain backups for rollback capability
- Ensure only target database remains

## Data Models

### DatabaseInfo
```python
@dataclass
class DatabaseInfo:
    path: str
    size: int
    tables: List[TableInfo]
    created_at: datetime
    last_modified: datetime
```

### TableInfo
```python
@dataclass
class TableInfo:
    name: str
    columns: List[ColumnInfo]
    row_count: int
    indexes: List[str]
```

### MigrationResult
```python
@dataclass
class MigrationResult:
    success: bool
    tables_migrated: int
    records_migrated: int
    conflicts_resolved: int
    errors: List[str]
```

## Error Handling

### Migration Errors
- **Schema Conflicts**: Log conflicts and provide manual resolution options
- **Data Corruption**: Stop migration and restore from backup
- **Disk Space**: Check available space before starting migration
- **Permission Issues**: Ensure proper file system permissions

### Rollback Strategy
1. Keep original databases until verification completes
2. Store backups in timestamped directory
3. Provide rollback command to restore original state
4. Log all operations for audit trail

### Error Recovery
- Automatic retry for transient errors
- Manual intervention prompts for critical errors
- Detailed error logging with stack traces
- Recovery suggestions for common issues

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock database operations for fast testing
- Verify error handling scenarios
- Test configuration updates

### Integration Tests
- Test full migration workflow with sample databases
- Verify data integrity after migration
- Test rollback functionality
- Validate application startup with consolidated database

### Performance Tests
- Test migration with large datasets
- Measure migration time and resource usage
- Verify application performance with consolidated database
- Test concurrent access scenarios

### Safety Tests
- Test migration failure scenarios
- Verify backup and restore functionality
- Test partial migration recovery
- Validate data consistency checks

## Implementation Phases

### Phase 1: Analysis and Backup
1. Scan existing database files
2. Analyze schemas and data
3. Create comprehensive backups
4. Generate migration plan

### Phase 2: Migration Execution
1. Create or prepare target database
2. Migrate tables and data
3. Handle conflicts and duplicates
4. Verify data integrity

### Phase 3: Configuration Update
1. Update application configuration
2. Modify environment variables
3. Test application startup
4. Validate all components work

### Phase 4: Cleanup and Verification
1. Final verification of consolidated database
2. Remove old database files
3. Clean up temporary files
4. Document new database structure

## Security Considerations

- Backup files stored securely with appropriate permissions
- Migration logs exclude sensitive data
- Database connections use secure methods
- Rollback capability maintains data security
- Access controls preserved during migration