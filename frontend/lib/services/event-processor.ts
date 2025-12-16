import { ProcessingEvent, AgentStep, ProcessingState, ProcessingError } from '../types/visualization'

export class EventProcessor {
  private eventQueue: ProcessingEvent[] = []
  private processingCallbacks: Map<string, (state: ProcessingState) => void> = new Map()

  processEvent(event: ProcessingEvent): void {
    this.eventQueue.push(event)
    this.handleEvent(event)
  }

  subscribeToFileProcessing(fileId: string, callback: (state: ProcessingState) => void): () => void {
    this.processingCallbacks.set(fileId, callback)
    
    // Return unsubscribe function
    return () => {
      this.processingCallbacks.delete(fileId)
    }
  }

  private handleEvent(event: ProcessingEvent): void {
    const callback = this.processingCallbacks.get(event.fileId)
    if (!callback) return

    // Get current processing state for this file
    const currentState = this.getProcessingState(event.fileId)
    
    // Update state based on event
    const updatedState = this.updateStateFromEvent(currentState, event)
    
    // Notify subscribers
    callback(updatedState)
  }

  private getProcessingState(fileId: string): ProcessingState {
    // Get events for this file
    const fileEvents = this.eventQueue.filter(e => e.fileId === fileId)
    
    if (fileEvents.length === 0) {
      return this.createInitialState()
    }

    // Build state from events
    return this.buildStateFromEvents(fileEvents)
  }

  private createInitialState(): ProcessingState {
    return {
      currentStep: 'upload',
      steps: [
        {
          id: 'upload',
          name: 'File Upload',
          description: 'Uploading and validating file',
          status: 'pending',
          progress: 0,
          metrics: this.createEmptyMetrics()
        },
        {
          id: 'ingestion',
          name: 'Data Ingestion',
          description: 'Processing and analyzing file content',
          status: 'pending',
          progress: 0,
          metrics: this.createEmptyMetrics()
        },
        {
          id: 'classification',
          name: 'Data Classification',
          description: 'Classifying data type and structure',
          status: 'pending',
          progress: 0,
          metrics: this.createEmptyMetrics()
        },
        {
          id: 'normalization',
          name: 'Data Normalization',
          description: 'Normalizing and cleaning data',
          status: 'pending',
          progress: 0,
          metrics: this.createEmptyMetrics()
        },
        {
          id: 'storage',
          name: 'Data Storage',
          description: 'Storing processed data',
          status: 'pending',
          progress: 0,
          metrics: this.createEmptyMetrics()
        }
      ],
      overallProgress: 0,
      estimatedTimeRemaining: 0,
      errors: []
    }
  }

  private buildStateFromEvents(events: ProcessingEvent[]): ProcessingState {
    const state = this.createInitialState()
    
    events.forEach(event => {
      this.updateStateFromEvent(state, event)
    })

    return state
  }

  private updateStateFromEvent(state: ProcessingState, event: ProcessingEvent): ProcessingState {
    const stepIndex = state.steps.findIndex(step => step.id === event.agentId)
    
    if (stepIndex === -1) {
      console.warn(`Unknown agent ID: ${event.agentId}`)
      return state
    }

    const step = { ...state.steps[stepIndex] }
    
    switch (event.eventType) {
      case 'started':
        step.status = 'active'
        step.startTime = event.timestamp
        step.progress = 0
        state.currentStep = event.agentId
        break

      case 'progress':
        step.progress = event.data.progress || 0
        if (event.metadata.processingTime) {
          step.metrics.processingTime = event.metadata.processingTime
        }
        break

      case 'decision':
        if (event.data.decision) {
          step.decision = {
            classification: event.data.decision.classification,
            confidence: event.data.decision.confidence,
            reasoning: event.data.decision.reasoning || [],
            alternativeOptions: event.data.decision.alternatives || [],
            usedLLM: event.data.decision.usedLLM || false,
            processingTime: event.metadata.processingTime || 0
          }
          step.confidence = event.data.decision.confidence
        }
        break

      case 'completed':
        step.status = 'completed'
        step.progress = 100
        step.endTime = event.timestamp
        if (event.metadata.processingTime) {
          step.metrics.processingTime = event.metadata.processingTime
        }
        
        // Move to next step
        const nextStepIndex = stepIndex + 1
        if (nextStepIndex < state.steps.length) {
          state.currentStep = state.steps[nextStepIndex].id
        }
        break

      case 'error':
        step.status = 'error'
        const error: ProcessingError = {
          type: event.data.errorType || 'unknown',
          severity: event.data.severity || 'error',
          message: event.data.message || 'An error occurred',
          technicalDetails: event.metadata.errorDetails || '',
          suggestedActions: event.data.suggestedActions || [],
          retryable: event.data.retryable || false
        }
        state.errors.push(error)
        break
    }

    // Update metrics from metadata
    if (event.metadata) {
      if (event.metadata.memoryUsage) step.metrics.memoryUsage = event.metadata.memoryUsage
      if (event.metadata.confidence) step.confidence = event.metadata.confidence
    }

    // Update the step in state
    state.steps[stepIndex] = step

    // Calculate overall progress
    state.overallProgress = this.calculateOverallProgress(state.steps)

    // Estimate remaining time
    state.estimatedTimeRemaining = this.estimateRemainingTime(state.steps)

    return state
  }

  private calculateOverallProgress(steps: AgentStep[]): number {
    const totalProgress = steps.reduce((sum, step) => sum + step.progress, 0)
    return Math.round(totalProgress / steps.length)
  }

  private estimateRemainingTime(steps: AgentStep[]): number {
    const activeStep = steps.find(step => step.status === 'active')
    if (!activeStep || !activeStep.startTime) return 0

    const elapsedTime = Date.now() - activeStep.startTime.getTime()
    const progressRatio = activeStep.progress / 100
    
    if (progressRatio === 0) return 0

    const estimatedStepTime = elapsedTime / progressRatio
    const remainingStepTime = estimatedStepTime - elapsedTime

    // Add estimated time for remaining steps (rough estimate)
    const remainingSteps = steps.filter(step => step.status === 'pending').length
    const avgStepTime = 30000 // 30 seconds average per step

    return Math.max(0, remainingStepTime + (remainingSteps * avgStepTime))
  }

  private createEmptyMetrics() {
    return {
      processingTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      throughput: 0,
      errorCount: 0
    }
  }

  // Get processing history for a file
  getFileEvents(fileId: string): ProcessingEvent[] {
    return this.eventQueue.filter(e => e.fileId === fileId)
  }

  // Clear old events to prevent memory leaks
  clearOldEvents(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoffTime = Date.now() - olderThanMs
    this.eventQueue = this.eventQueue.filter(event => 
      event.timestamp.getTime() > cutoffTime
    )
  }
}

// Singleton instance
let eventProcessor: EventProcessor | null = null

export function getEventProcessor(): EventProcessor {
  if (!eventProcessor) {
    eventProcessor = new EventProcessor()
  }
  return eventProcessor
}