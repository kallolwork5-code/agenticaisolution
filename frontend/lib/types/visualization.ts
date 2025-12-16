// Types for the agentic data processing visualization system

export interface ProcessingEvent {
  id: string
  fileId: string
  agentId: string
  eventType: 'started' | 'progress' | 'decision' | 'completed' | 'error'
  timestamp: Date
  data: Record<string, any>
  metadata: EventMetadata
}

export interface EventMetadata {
  confidence?: number
  processingTime?: number
  memoryUsage?: number
  errorDetails?: string
  retryCount?: number
}

export interface AgentStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error' | 'retrying'
  progress: number
  startTime?: Date
  endTime?: Date
  confidence?: number
  decision?: AgentDecision
  metrics: StepMetrics
}

export interface AgentDecision {
  classification: string
  confidence: number
  reasoning: string[]
  alternativeOptions: string[]
  usedLLM: boolean
  processingTime: number
}

export interface StepMetrics {
  processingTime: number
  memoryUsage: number
  cpuUsage: number
  throughput: number
  errorCount: number
}

export interface ProcessingState {
  currentStep: string
  steps: AgentStep[]
  overallProgress: number
  estimatedTimeRemaining: number
  errors: ProcessingError[]
}

export interface ProcessingError {
  type: 'validation' | 'classification' | 'storage' | 'network' | 'timeout'
  severity: 'warning' | 'error' | 'critical'
  message: string
  technicalDetails: string
  suggestedActions: string[]
  retryable: boolean
}

export interface ProcessingFile {
  id: string
  name: string
  size: number
  type: string
  processingState: ProcessingState
  priority: number
}

export interface VisualizationState {
  activeFiles: Map<string, ProcessingState>
  selectedStep: string | null
  viewMode: 'detailed' | 'simplified'
  animationSpeed: number
  showMetrics: boolean
  filters: VisualizationFilters
}

export interface VisualizationFilters {
  showOnlyErrors: boolean
  hideCompletedSteps: boolean
  agentTypes: string[]
  timeRange: { start: Date; end: Date }
}

export interface DataSample {
  preview: string
  schema: Record<string, any>
  rowCount: number
  confidence: number
}

export interface FlowParticle {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  type: 'data' | 'decision' | 'error'
  color: string
  size: number
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'processing_event' | 'agent_update' | 'error' | 'connection_status'
  payload: any
  timestamp: Date
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  lastConnected?: Date
  error?: string
}