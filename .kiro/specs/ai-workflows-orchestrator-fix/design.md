# Design Document

## Overview

This design addresses the critical issues in the AI Workflows orchestrator functionality by implementing proper agent name matching, consistent status updates, and accurate execution history tracking. The solution focuses on fixing the disconnect between the dummy agent data, orchestrator execution logic, and UI updates.

## Architecture

### Current Issues Analysis

1. **Agent Name Mismatch**: The orchestrator uses hardcoded agent names ('SLA Calculator Agent', 'Routing Optimization Agent', 'Settlement Analysis Agent') that don't exactly match the availableAgents array names
2. **Partial String Matching**: The updateAgentStatus function uses `agent.name.toLowerCase().includes(agentName.toLowerCase())` which can cause incorrect matches
3. **Inconsistent Data Flow**: The execution history shows different agent names than what's actually being executed
4. **State Management Issues**: Agent status updates may not be properly triggering UI re-renders

### Solution Architecture

The fix will implement a centralized agent management system that ensures consistency across all components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Agent Store   │────│   Orchestrator   │────│   UI Updates    │
│                 │    │                  │    │                 │
│ - Agent Names   │    │ - Status Updates │    │ - Progress Cards│
│ - Status State  │    │ - Progress Track │    │ - History Table │
│ - Progress Data │    │ - History Mgmt   │    │ - Logs Display  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components and Interfaces

### 1. Agent Management System

**Enhanced Agent Interface**
```typescript
interface Agent {
  id: string
  name: string
  displayName: string  // For UI display
  executionName: string // For orchestrator matching
  description: string
  category: string
  inputs: string[]
  outputs: string[]
  estimated_duration: string
  icon: string
  status: AgentStatus
  progress: number
  currentStep?: string
  startTime?: Date
  endTime?: Date
  results?: AgentResults
  error?: string
}

interface AgentResults {
  insights_generated: number
  processing_time: number
  data_processed: number
  recommendations: string[]
}
```

**Agent Name Mapping**
```typescript
const AGENT_NAME_MAPPING = {
  'SLA Calculator Agent': 'sla_calculation',
  'Routing Optimization Agent': 'routing_optimization', 
  'Settlement Analysis Agent': 'settlement_analysis'
}
```

### 2. Orchestrator Engine

**Enhanced Orchestrator Functions**
```typescript
interface OrchestrationEngine {
  startWorkflow(templateId: string): Promise<void>
  updateAgentStatus(agentId: string, status: AgentStatus, progress: number): void
  getAgentByName(name: string): Agent | undefined
  createExecutionHistory(): WorkflowExecution
  resetAgentStates(): void
}
```

**Status Update Pipeline**
1. Orchestrator calls `updateAgentStatus` with exact agent ID
2. Function finds agent by ID (not name matching)
3. Updates agent state in React state
4. Triggers UI re-render with new status
5. Logs orchestrator message with consistent naming

### 3. Execution History Management

**History Entry Creation**
```typescript
interface ExecutionHistoryEntry {
  workflow_id: string
  name: string
  status: ExecutionStatus
  execution_date: string
  agents_executed: string[] // Actual agent IDs executed
  agent_results: AgentExecutionDetail[]
  orchestrator_logs: string[]
  performance_metrics: ExecutionMetrics
}
```

## Data Models

### Agent Status Flow
```
idle → preparing → retrieving_data → running → completed
  ↓                                      ↓
error ←─────────────────────────────── error
```

### Progress Tracking
- **preparing**: 5% - Agent initialization
- **retrieving_data**: 15% - Data source connection
- **running**: 25-95% - Progressive execution phases
- **completed**: 100% - Execution finished
- **error**: 0% - Execution failed

### Orchestrator Log Format
```
[HH:MM:SS] - 🚀 Workflow orchestration initiated
[HH:MM:SS] - 📋 Loading workflow configuration: 3 agents configured
[HH:MM:SS] - 🎯 Agent engagement: SLA Calculator Agent
[HH:MM:SS] - 📥 Pulling prompts for SLA Calculator Agent...
[HH:MM:SS] - 📊 Retrieving data sources for SLA Calculator Agent...
[HH:MM:SS] - 🤖 Engaging SLA Calculator Agent execution...
[HH:MM:SS] - ✅ SLA Calculator Agent execution completed successfully
```

## Error Handling

### Agent Matching Errors
- If agent name not found, log error and skip update
- Provide fallback to partial matching with warning
- Display error in orchestrator logs

### Status Update Failures
- Validate status transitions before applying
- Log invalid status changes
- Maintain previous valid state on error

### UI Update Issues
- Implement retry mechanism for failed state updates
- Add loading states during transitions
- Show error indicators for failed updates

## Testing Strategy

### Unit Tests
1. **Agent Name Matching**
   - Test exact ID matching
   - Test fallback name matching
   - Test invalid agent names

2. **Status Updates**
   - Test valid status transitions
   - Test invalid status transitions
   - Test progress value validation

3. **History Creation**
   - Test execution history generation
   - Test agent result aggregation
   - Test timing calculations

### Integration Tests
1. **Full Workflow Execution**
   - Test complete workflow from start to finish
   - Verify all agents update correctly
   - Confirm history entry creation

2. **UI Updates**
   - Test progress card updates
   - Test orchestrator log display
   - Test history table updates

### Manual Testing Scenarios
1. Start workflow and verify each agent shows progress
2. Check orchestrator logs match agent names
3. Verify execution history shows correct agents
4. Test error scenarios and recovery
5. Validate UI responsiveness during execution

## Implementation Notes

### Key Changes Required

1. **Fix Agent Name Matching**
   - Replace hardcoded agent names with actual agent IDs from availableAgents
   - Update updateAgentStatus to use exact ID matching
   - Ensure consistent naming throughout orchestrator

2. **Improve State Management**
   - Add proper React state updates with functional updates
   - Implement proper dependency arrays in useEffect
   - Add state validation and error boundaries

3. **Enhance Execution History**
   - Create history entries from actual execution data
   - Remove conflicts with dummy history data
   - Implement proper timestamp and duration tracking

4. **UI Improvements**
   - Add loading states and transitions
   - Improve error display and recovery
   - Enhance progress visualization

### Performance Considerations
- Minimize unnecessary re-renders during status updates
- Batch multiple status updates when possible
- Optimize orchestrator log updates to prevent memory leaks
- Implement proper cleanup on component unmount