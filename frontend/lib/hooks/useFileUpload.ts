import { useState, useEffect, useCallback } from 'react'
import { fileUploadService, UploadProgress, FileUploadResponse } from '../services/FileUploadService'

export interface UploadedFile extends UploadProgress {
  id: string
  size: number
  type: string
  uploadedAt: Date
  errorMessage?: string
}

export interface UseFileUploadReturn {
  files: UploadedFile[]
  isUploading: boolean
  uploadFiles: (files: FileList) => Promise<void>
  removeFile: (fileId: string) => void
  retryUpload: (fileId: string) => Promise<void>
  clearAll: () => void
  getFileById: (fileId: string) => UploadedFile | undefined
}

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await fileUploadService.initializeWebSocket()
        setWsConnected(true)
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setWsConnected(false)
      }
    }

    initWebSocket()

    // Cleanup on unmount
    return () => {
      fileUploadService.disconnect()
    }
  }, [])

  // Handle progress updates from WebSocket
  const handleProgressUpdate = useCallback((progress: UploadProgress) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === progress.fileId 
          ? { 
              ...file, 
              progress: progress.progress,
              status: progress.status,
              processedRecords: progress.processedRecords,
              errorMessage: progress.message
            }
          : file
      )
    )
  }, [])

  // Upload multiple files
  const uploadFiles = useCallback(async (fileList: FileList) => {
    if (fileList.length === 0) return

    setIsUploading(true)

    try {
      // Validate all files first
      const validationErrors: string[] = []
      Array.from(fileList).forEach((file, index) => {
        const validation = fileUploadService.validateFile(file)
        if (!validation.valid) {
          validationErrors.push(`${file.name}: ${validation.error}`)
        }
      })

      if (validationErrors.length > 0) {
        throw new Error(`Validation failed:\n${validationErrors.join('\n')}`)
      }

      // Create initial file entries
      const newFiles: UploadedFile[] = Array.from(fileList).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        fileId: '',
        fileName: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading' as const,
        uploadedAt: new Date()
      }))

      setFiles(prevFiles => [...prevFiles, ...newFiles])

      // Upload files one by one to avoid overwhelming the server
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        const fileEntry = newFiles[i]

        try {
          // Subscribe to progress updates
          fileUploadService.subscribeToProgress(fileEntry.id, handleProgressUpdate)

          // Start upload
          const uploadResponse = await fileUploadService.uploadFile(
            file,
            (progress) => {
              setFiles(prevFiles =>
                prevFiles.map(f =>
                  f.id === fileEntry.id
                    ? { ...f, ...progress, fileId: progress.fileId }
                    : f
                )
              )
            }
          )

          // Update file entry with server response
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === fileEntry.id
                ? { ...f, fileId: uploadResponse.fileId }
                : f
            )
          )

        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error)
          
          // Mark file as error
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === fileEntry.id
                ? { 
                    ...f, 
                    status: 'error' as const, 
                    errorMessage: error instanceof Error ? error.message : 'Upload failed'
                  }
                : f
            )
          )
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Show error to user (you might want to use a toast notification here)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [handleProgressUpdate])

  // Remove a file
  const removeFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    try {
      // If file has been uploaded to server, delete it there too
      if (file.fileId) {
        await fileUploadService.deleteFile(file.fileId)
      }
      
      // Unsubscribe from progress updates
      fileUploadService.unsubscribeFromProgress(file.fileId)
      
      // Remove from local state
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error removing file:', error)
      // Still remove from UI even if server deletion failed
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
    }
  }, [files])

  // Retry upload for a failed file
  const retryUpload = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file || file.status !== 'error') return

    // Reset file status
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId
          ? { ...f, status: 'uploading' as const, progress: 0, errorMessage: undefined }
          : f
      )
    )

    // Note: In a real implementation, you'd need to store the original File object
    // to retry the upload. For now, this is a placeholder.
    console.log('Retry upload not fully implemented - would need original File object')
  }, [files])

  // Clear all files
  const clearAll = useCallback(() => {
    // Unsubscribe from all progress updates
    files.forEach(file => {
      if (file.fileId) {
        fileUploadService.unsubscribeFromProgress(file.fileId)
      }
    })
    
    setFiles([])
  }, [files])

  // Get file by ID
  const getFileById = useCallback((fileId: string) => {
    return files.find(f => f.id === fileId)
  }, [files])

  return {
    files,
    isUploading,
    uploadFiles,
    removeFile,
    retryUpload,
    clearAll,
    getFileById
  }
}