# Requirements Document

## Introduction

The AI Workflows component has several issues with orchestrator agent status updates and individual agent progress display. The current implementation has mismatched agent names, incorrect status updates, and the dummy execution history shows different entries than what's being executed. This feature will fix the orchestrator functionality to properly update agent statuses, display real-time progress, and maintain consistency between the execution and history.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see accurate real-time updates of individual agent progress during workflow execution, so that I can monitor the current status of each agent.

#### Acceptance Criteria

1. WHEN a workflow is started THEN the system SHALL reset all agents to idle status with 0% progress
2. WHEN an agent begins execution THEN the system SHALL update the agent status to 'preparing' with 5% progress
3. WHEN an agent progresses through execution phases THEN the system SHALL update progress incrementally (preparing → retrieving_data → running → completed)
4. WHEN an agent completes successfully THEN the system SHALL set status to 'completed' with 100% progress and display results
5. WHEN an agent encounters an error THEN the system SHALL set status to 'error' and display the error message

### Requirement 2

**User Story:** As a user, I want the orchestrator logs to accurately reflect the agents being executed, so that I can track the workflow progress correctly.

#### Acceptance Criteria

1. WHEN a workflow starts THEN the orchestrator SHALL log the correct agent names that will be executed
2. WHEN an agent starts THEN the orchestrator SHALL log the exact agent name from the availableAgents array
3. WHEN agent progress updates THEN the orchestrator SHALL use consistent agent naming throughout the execution
4. WHEN the workflow completes THEN the orchestrator SHALL create a history entry with the correct agent names and results

### Requirement 3

**User Story:** As a user, I want the agent name matching to work correctly, so that status updates are applied to the right agents in the UI.

#### Acceptance Criteria

1. WHEN updateAgentStatus is called THEN the system SHALL match agent names exactly (not using partial matching)
2. WHEN agent names are used in orchestrator logs THEN they SHALL match the exact names in the availableAgents array
3. WHEN workflow execution starts THEN the system SHALL use the actual agent names from availableAgents instead of hardcoded names
4. WHEN creating execution history THEN the system SHALL use the same agent names that were actually executed

### Requirement 4

**User Story:** As a user, I want to see consistent execution history that matches what was actually executed, so that I can review past workflow runs accurately.

#### Acceptance Criteria

1. WHEN a workflow completes THEN the system SHALL add an execution record with the correct agent names
2. WHEN viewing execution history THEN the displayed agent names SHALL match the agents that were actually executed
3. WHEN a workflow is running THEN the current execution SHALL not conflict with the dummy history data
4. WHEN execution history is displayed THEN it SHALL show the most recent executions first

### Requirement 5

**User Story:** As a user, I want the agent progress cards to display real-time updates with proper visual feedback, so that I can see the current state of each agent clearly.

#### Acceptance Criteria

1. WHEN an agent status changes THEN the progress card SHALL update the status indicator and color immediately
2. WHEN an agent progress increases THEN the progress bar SHALL animate to the new percentage
3. WHEN an agent is running THEN the current step description SHALL be displayed and updated
4. WHEN an agent completes THEN the results summary SHALL be displayed in the progress card
5. WHEN an agent fails THEN the error message SHALL be displayed with appropriate error styling