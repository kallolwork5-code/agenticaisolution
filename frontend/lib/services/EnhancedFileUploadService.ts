/**
 * Enhanced file upload service with agentic behavior and real-time updates
 */

import axios from 'axios'
import WebSocketService, { AgentUpdate } from './WebSocketService'

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : ''

export interface EnhancedUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'duplicate'
  currentAgent?: string
  currentStep?: string
  message?: string
  agentUpdates: AgentUpdate[]
  classification?: {
    data_type: string
    confidence: number
    reasoning: string
    method: string
  }
  insights?: any
}

export interface EnhancedUploadResponse {
  file_id: string
  filename: string
  size: number
  type: string
  content_hash: string
  status: string
  websocket_url: string
  message: string
}

export interface ProgressCallback {
  (progress: EnhancedUploadProgress): void
}

export class EnhancedFileUploadService {
  private activeUploads: Map<string, WebSocketService> = new Map()

  async uploadFile(file: File, onProgress?: ProgressCallback): Promise<EnhancedUploadResponse> {
    // Validate file
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    
    // Optional metadata
    const metadata = {
      uploadedAt: new Date().toISOString(),
      clientInfo: {
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    }
    formData.append('metadata', JSON.stringify(metadata))

    try {
      // Upload file using enhanced API
      const response = await axios.post<EnhancedUploadResponse>(
        `${API_BASE_URL}/api/enhanced/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for upload
        }
      )

      const uploadResponse = response.data
      
      // Set up WebSocket for real-time progress tracking
      if (onProgress) {
        await this.setupProgressTracking(uploadResponse.file_id, uploadResponse.filename, onProgress)
      }

      return uploadResponse

    } catch (error) {
      console.error('Enhanced upload failed:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Upload failed')
      }
      throw error
    }
  }

  private async setupProgressTracking(fileId: string, fileName: string, onProgress: ProgressCallback) {
    try {
      const wsService = new WebSocketService(fileId)
      this.activeUploads.set(fileId, wsService)

      // Initialize progress state
      const progressState: EnhancedUploadProgress = {
        fileId,
        fileName,
        progress: 0,
        status: 'uploading',
        agentUpdates: [],
        message: 'Connecting to real-time updates...'
      }

      // Set up WebSocket callbacks
      wsService.addCallback((update: AgentUpdate) => {
        this.handleAgentUpdate(update, progressState, onProgress)
      })

      // Connect to WebSocket
      await wsService.connect()
      
      // Send initial progress
      progressState.message = 'Connected to real-time updates'
      onProgress(progressState)

    } catch (error) {
      console.error('Failed to setup progress tracking:', error)
      // Continue without WebSocket if it fails
      onProgress({
        fileId,
        fileName,
        progress: 10,
        status: 'processing',
        agentUpdates: [],
        message: 'Processing file (real-time updates unavailable)...'
      })
    }
  }

  private handleAgentUpdate(update: AgentUpdate, progressState: EnhancedUploadProgress, onProgress: ProgressCallback) {
    // Add update to history
    progressState.agentUpdates.push(update)

    // Update progress based on update type
    switch (update.type) {
      case 'connection_established':
        progressState.progress = 5
        progressState.message = 'Real-time connection established'
        break

      case 'agent_update':
        progressState.currentAgent = update.agent
        progressState.message = update.message || 'Processing...'
        
        // Update progress based on agent and status
        if (update.agent === 'File Processor' && update.status === 'completed') {
          progressState.progress = 20
        } else if (update.agent === 'Rule-Based Classifier') {
          progressState.progress = update.status === 'completed' ? 40 : 30
        } else if (update.agent === 'AI Classifier') {
          progressState.progress = update.status === 'completed' ? 60 : 50
        } else if (update.agent === 'Data Ingestion Agent') {
          progressState.progress = update.status === 'completed' ? 85 : 70
        } else if (update.agent === 'Insights Generator') {
          progressState.progress = update.status === 'completed' ? 95 : 90
        }

        // Handle status changes
        if (update.status === 'error') {
          progressState.status = 'error'
          progressState.progress = 0
        }
        break

      case 'classification_result':
        progressState.classification = {
          data_type: update.data_type || 'unknown',
          confidence: update.confidence || 0,
          reasoning: update.reasoning || '',
          method: update.method || 'unknown'
        }
        progressState.progress = 65
        progressState.message = `Classified as ${update.data_type} (${Math.round((update.confidence || 0) * 100)}% confidence)`
        break

      case 'ingestion_result':
        progressState.progress = 90
        progressState.message = `Data ingestion completed - ${update.data?.records_processed || 0} records processed`
        break

      default:
        // Handle completion
        if (update.agent === 'Processing Complete') {
          progressState.status = 'completed'
          progressState.progress = 100
          progressState.message = 'File processing completed successfully!'
          
          // Store insights if available
          if (update.data?.insights) {
            progressState.insights = update.data.insights
          }
          
          // Clean up WebSocket
          setTimeout(() => {
            this.disconnectWebSocket(progressState.fileId)
          }, 5000) // Keep connection for 5 more seconds
        }
        break
    }

    // Call progress callback
    onProgress(progressState)
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' }
    }

    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['xlsx', 'xls', 'csv', 'pdf', 'doc', 'docx']
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Unsupported file type. Please upload Excel, CSV, PDF, or Word files.' }
    }

    return { valid: true }
  }

  async getFileStatus(fileId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/enhanced/status/${fileId}`)
      return response.data
    } catch (error) {
      console.error('Error getting file status:', error)
      throw error
    }
  }

  async getUploadedFiles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/files/list`)
      return response.data.files || []
    } catch (error) {
      console.error('Error getting uploaded files:', error)
      throw error
    }
  }

  async deleteFile(fileId: string) {
    try {
      // Disconnect WebSocket if active
      this.disconnectWebSocket(fileId)
      
      const response = await axios.delete(`${API_BASE_URL}/api/files/${fileId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  disconnectWebSocket(fileId: string) {
    const wsService = this.activeUploads.get(fileId)
    if (wsService) {
      wsService.disconnect()
      this.activeUploads.delete(fileId)
    }
  }

  disconnectAll() {
    this.activeUploads.forEach((wsService) => {
      wsService.disconnect()
    })
    this.activeUploads.clear()
  }
}

export const enhancedFileUploadService = new EnhancedFileUploadService()
export default enhancedFileUploadService