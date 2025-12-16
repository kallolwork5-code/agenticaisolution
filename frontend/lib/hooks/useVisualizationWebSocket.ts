import { useEffect, useRef, useCallback } from 'react'
import { getWebSocketManager } from '../services/websocket-manager'
import { getEventProcessor } from '../services/event-processor'
import { useVisualizationActions } from '../stores/visualization-store'
import { ProcessingEvent, WebSocketMessage, ProcessingFile } from '../types/visualization'

export function useVisualizationWebSocket() {
  const wsManager = useRef(getWebSocketManager())
  const eventProcessor = useRef(getEventProcessor())
  const actions = useVisualizationActions()
  const isConnected = useRef(false)

  // Connect to WebSocket on mount
  useEffect(() => {
    const connect = async () => {
      try {
        await wsManager.current.connect()
        isConnected.current = true
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        actions.setConnectionStatus({
          connected: false,
          reconnecting: false,
          error: 'Failed to connect'
        })
      }
    }

    connect()

    // Cleanup on unmount
    return () => {
      wsManager.current.disconnect()
      isConnected.current = false
    }
  }, [actions])

  // Set up event handlers
  useEffect(() => {
    const unsubscribeHandlers: (() => void)[] = []

    // Handle connection status changes
    const unsubscribeConnection = wsManager.current.onConnectionStatus((status) => {
      actions.setConnectionStatus(status)
      isConnected.current = status.connected
    })
    unsubscribeHandlers.push(unsubscribeConnection)

    // Handle processing events
    const unsubscribeProcessingEvents = wsManager.current.subscribe(
      'processing_event',
      (message: WebSocketMessage) => {
        const event = message.payload as ProcessingEvent
        eventProcessor.current.processEvent(event)
      }
    )
    unsubscribeHandlers.push(unsubscribeProcessingEvents)

    // Handle agent updates
    const unsubscribeAgentUpdates = wsManager.current.subscribe(
      'agent_update',
      (message: WebSocketMessage) => {
        const { fileId, processingState } = message.payload
        actions.updateFileProcessingState(fileId, processingState)
      }
    )
    unsubscribeHandlers.push(unsubscribeAgentUpdates)

    // Handle errors
    const unsubscribeErrors = wsManager.current.subscribe(
      'error',
      (message: WebSocketMessage) => {
        console.error('WebSocket error message:', message.payload)
      }
    )
    unsubscribeHandlers.push(unsubscribeErrors)

    // Cleanup handlers
    return () => {
      unsubscribeHandlers.forEach(unsubscribe => unsubscribe())
    }
  }, [actions])

  // Subscribe to file processing updates
  const subscribeToFile = useCallback((fileId: string) => {
    return eventProcessor.current.subscribeToFileProcessing(fileId, (processingState) => {
      actions.updateFileProcessingState(fileId, processingState)
    })
  }, [actions])

  // Start monitoring a file
  const startFileMonitoring = useCallback((file: ProcessingFile) => {
    actions.addFile(file)
    return subscribeToFile(file.id)
  }, [actions, subscribeToFile])

  // Stop monitoring a file
  const stopFileMonitoring = useCallback((fileId: string) => {
    actions.removeFile(fileId)
  }, [actions])

  // Send a message to the backend
  const sendMessage = useCallback((type: string, payload: any) => {
    if (isConnected.current) {
      wsManager.current.send({
        type,
        payload,
        timestamp: new Date()
      })
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [])

  // Request file processing status
  const requestFileStatus = useCallback((fileId: string) => {
    sendMessage('request_file_status', { fileId })
  }, [sendMessage])

  // Request to retry failed processing
  const retryProcessing = useCallback((fileId: string, stepId?: string) => {
    sendMessage('retry_processing', { fileId, stepId })
  }, [sendMessage])

  return {
    isConnected: isConnected.current,
    startFileMonitoring,
    stopFileMonitoring,
    subscribeToFile,
    sendMessage,
    requestFileStatus,
    retryProcessing
  }
}

// Hook for components that only need to listen to specific files
export function useFileProcessingStatus(fileId: string) {
  const { subscribeToFile } = useVisualizationWebSocket()
  
  useEffect(() => {
    const unsubscribe = subscribeToFile(fileId)
    return unsubscribe
  }, [fileId, subscribeToFile])
}