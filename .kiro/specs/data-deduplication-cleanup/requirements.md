# Single Database Consolidation Requirements

## Introduction

This feature will consolidate all existing database files into a single unified database for the CollectiSense AI application, eliminating duplicate database files and ensuring all data is stored in one location.

## Requirements

### Requirement 1: Single Database Consolidation

**User Story:** As a system administrator, I want all data consolidated into one database file, so that there is a single source of truth and no duplicate database files.

#### Acceptance Criteria

1. WHEN the consolidation script runs THEN it SHALL identify all existing .db files in the backend directory
2. WHEN multiple database files exist THEN the system SHALL merge all data into collectisense.db
3. WHEN merging data THEN the system SHALL preserve all existing user accounts and application data
4. WHEN consolidation completes THEN the system SHALL remove all other .db files except collectisense.db
5. IF duplicate records exist during merge THEN the system SHALL keep the most recent version based on timestamps

### Requirement 2: Application Configuration Update

**User Story:** As a developer, I want the application to use only the single consolidated database, so that all components access the same data source.

#### Acceptance Criteria

1. WHEN the application starts THEN it SHALL connect only to collectisense.db
2. WHEN database connections are established THEN all models SHALL use the same database instance
3. WHEN configuration is updated THEN environment variables SHALL point to the single database
4. WHEN tests run THEN they SHALL use a separate test database that doesn't interfere with the main database
5. IF the main database doesn't exist THEN the system SHALL create it with proper schema

### Requirement 3: Data Migration Safety

**User Story:** As a system administrator, I want data migration to be safe and reversible, so that no data is lost during consolidation.

#### Acceptance Criteria

1. WHEN migration starts THEN the system SHALL create backups of all existing database files
2. WHEN errors occur during migration THEN the system SHALL stop and provide rollback options
3. WHEN migration completes THEN the system SHALL verify all data was transferred correctly
4. WHEN verification passes THEN the system SHALL confirm it's safe to remove old database files
5. IF verification fails THEN the system SHALL restore from backups and report errors