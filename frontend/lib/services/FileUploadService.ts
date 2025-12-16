export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'duplicate'
  message?: string
  processedRecords?: number
}

export interface FileUploadResponse {
  fileId: string
  fileName: string
  size: number
  type: string
  uploadUrl?: string
}

export class FileUploadService {
  private baseUrl: string
  private wsConnection: WebSocket | null = null
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map()

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  // Initialize WebSocket connection for real-time progress updates
  initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws/upload-progress'
        this.wsConnection = new WebSocket(wsUrl)

        this.wsConnection.onopen = () => {
          console.log('WebSocket connection established')
          resolve()
        }

        this.wsConnection.onmessage = (event) => {
          try {
            const progress: UploadProgress = JSON.parse(event.data)
            const callback = this.progressCallbacks.get(progress.fileId)
            if (callback) {
              callback(progress)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.wsConnection.onclose = () => {
          console.log('WebSocket connection closed')
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            this.initializeWebSocket()
          }, 3000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Subscribe to progress updates for a specific file
  subscribeToProgress(fileId: string, callback: (progress: UploadProgress) => void): void {
    this.progressCallbacks.set(fileId, callback)
  }

  // Unsubscribe from progress updates
  unsubscribeFromProgress(fileId: string): void {
    this.progressCallbacks.delete(fileId)
  }

  // Upload a single file
  async uploadFile(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse> {
    try {
      // Upload the file directly with progress tracking
      const uploadResponse = await this.uploadWithProgress(
        file, 
        onProgress
      )

      return uploadResponse
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  // Upload file with XMLHttpRequest for progress tracking (schema-agnostic)
  private uploadWithProgress(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata for schema-agnostic processing
      formData.append('metadata', JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        // Schema detection will be handled by backend
        schemaDetection: 'auto'
      }))

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress({
            fileId: 'uploading', // Will be updated once we get response
            fileName: file.name,
            progress,
            status: 'uploading'
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            
            // Start polling for status updates after upload
            if (response.file_id && onProgress) {
              this.pollFileStatus(response.file_id, onProgress)
            }
            
            resolve({
              fileId: response.file_id,
              fileName: response.filename,
              size: response.size,
              type: response.type
            })
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      // Try enhanced upload first, fallback to regular upload
      xhr.open('POST', `${this.baseUrl}/api/enhanced-upload/upload-no-auth`)
      xhr.send(formData)
    })
  }

  // Upload multiple files
  async uploadFiles(
    files: FileList, 
    onProgress?: (fileId: string, progress: UploadProgress) => void
  ): Promise<FileUploadResponse[]> {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadFile(file, onProgress ? (progress) => onProgress(progress.fileId, progress) : undefined)
    )

    try {
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Multiple file upload error:', error)
      throw error
    }
  }

  // Get file processing status
  async getFileStatus(fileId: string): Promise<UploadProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/status/${fileId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get file status: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Convert backend response to frontend format
      return {
        fileId: data.file_id,
        fileName: data.filename,
        progress: data.progress || 0,
        status: data.status,
        message: data.error_message || 'Processing...',
        processedRecords: data.processed_records
      }
    } catch (error) {
      console.error('Error getting file status:', error)
      throw error
    }
  }

  // Delete a file
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Get list of uploaded files
  async getUploadedFiles(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/list`)
      
      if (!response.ok) {
        throw new Error(`Failed to get files: ${response.statusText}`)
      }

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('Error getting files:', error)
      throw error
    }
  }

  // Poll file status for progress updates
  private async pollFileStatus(fileId: string, onProgress: (progress: UploadProgress) => void): Promise<void> {
    const maxAttempts = 60 // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        attempts++
        const status = await this.getFileStatus(fileId)
        
        onProgress(status)
        
        // Continue polling if still processing and haven't exceeded max attempts
        if ((status.status === 'processing' || status.status === 'uploaded') && attempts < maxAttempts) {
          setTimeout(poll, status.status === 'uploaded' ? 2000 : 5000) // Poll faster for uploaded status
        }
        // Stop polling for final states: completed, duplicate, error
      } catch (error) {
        console.error('Error polling file status:', error)
        onProgress({
          fileId,
          fileName: 'Unknown',
          progress: 0,
          status: 'error',
          message: 'Failed to get file status'
        })
      }
    }

    // Start polling after a short delay to allow backend processing to begin
    setTimeout(poll, 1000)
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload Excel, CSV, PDF, or Word files.' }
    }

    return { valid: true }
  }

  // Close WebSocket connection
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
    this.progressCallbacks.clear()
  }
}

// Singleton instance
export const fileUploadService = new FileUploadService()