'use client'

import { useCallback, useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Layers,
  Brain,
  Zap,
  Activity
} from 'lucide-react'
import { fileUploadService, UploadProgress } from '@/lib/services/FileUploadService'
import { useWebSocket } from '@/lib/hooks/useWebSocket'
import SchemaManager from './SchemaManager'

interface UploadedFile {
  id: string
  fileName: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'duplicate'
  progress: number
  uploadedAt: Date
  processedRecords?: number
  errorMessage?: string
}

interface AgentUpdate {
  type: string
  timestamp: string
  agent: string
  status: string
  message: string
  data?: any
}

interface ClassificationResult {
  type: string
  data_type: string
  confidence: number
  reasoning: string
  method: string
}

interface DataManagementProps {
  className?: string
}

export default function DataManagement({ className = '' }: DataManagementProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<'uploads' | 'schemas'>('uploads')
  
  // Enhanced upload state
  const [currentFileId, setCurrentFileId] = useState<string | null>(null)
  const [agentUpdates, setAgentUpdates] = useState<AgentUpdate[]>([])
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)

  // WebSocket connection for real-time updates
  const { connectionStatus, lastMessage, messages } = useWebSocket(
    currentFileId ? `ws://localhost:8000/ws/upload/${currentFileId}` : null,
    {
      onMessage: (message) => {
        console.log('WebSocket message received:', message)
        
        if (message.type === 'agent_update') {
          setAgentUpdates(prev => [...prev, message as unknown as AgentUpdate])
        } else if (message.type === 'classification_result') {
          setClassificationResult(message as unknown as ClassificationResult)
        } else if (message.type === 'processing_complete') {
          setProcessingComplete(true)
          setIsUploading(false)
          // Auto-close after 5 seconds
          setTimeout(() => {
            setCurrentFileId(null)
            setAgentUpdates([])
            setClassificationResult(null)
            setProcessingComplete(false)
          }, 5000)
        }
      },
      onOpen: () => {
        console.log('WebSocket connected')
      },
      onClose: () => {
        console.log('WebSocket disconnected')
      }
    }
  )



  // Load existing files on component mount
  useEffect(() => {
    loadExistingFiles()
  }, [])

  const loadExistingFiles = async () => {
    try {
      const existingFiles = await fileUploadService.getUploadedFiles()
      const formattedFiles: UploadedFile[] = existingFiles.map(file => ({
        id: file.id,
        fileName: file.filename,
        size: file.file_size || 0,
        type: file.type || 'unknown',
        status: file.status === 'completed' ? 'completed' : 
                file.status === 'duplicate' ? 'duplicate' :
                file.status === 'error' ? 'error' : 
                file.status === 'processing' ? 'processing' : 'uploading',
        progress: file.progress || (file.status === 'completed' || file.status === 'duplicate' ? 100 : 0),
        uploadedAt: new Date(file.uploaded_at || Date.now()),
        processedRecords: file.records,
        errorMessage: file.error_message
      }))
      setFiles(formattedFiles)
    } catch (error) {
      console.error('Error loading existing files:', error)
    }
  }

  const uploadFiles = useCallback(async (uploadFileList: FileList) => {
    setIsUploading(true)
    setAgentUpdates([])
    setClassificationResult(null)
    setProcessingComplete(false)
    
    try {
      for (const file of Array.from(uploadFileList)) {
        // Validate file first
        const validation = fileUploadService.validateFile(file)
        if (!validation.valid) {
          // Add error file entry
          const errorFile: UploadedFile = {
            id: Math.random().toString(36).substring(2, 9),
            fileName: file.name,
            size: file.size,
            type: file.type,
            status: 'error',
            progress: 0,
            uploadedAt: new Date(),
            errorMessage: validation.error
          }
          setFiles(prev => [...prev, errorFile])
          continue
        }

        // Create initial file entry
        const tempId = Math.random().toString(36).substring(2, 9)
        const newFile: UploadedFile = {
          id: tempId,
          fileName: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          uploadedAt: new Date()
        }
        
        setFiles(prev => [...prev, newFile])
        
        // Try enhanced upload first, fallback to regular upload
        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/enhanced-upload/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })

          if (response.ok) {
            const result = await response.json()
            
            // Set up WebSocket connection for this file
            setCurrentFileId(result.file_id)
            
            // Update file with enhanced upload response
            setFiles(prev => prev.map(f => 
              f.id === tempId 
                ? { 
                    ...f, 
                    id: result.file_id,
                    status: result.status === 'duplicate' ? 'duplicate' : 'processing',
                    progress: result.status === 'duplicate' ? 100 : 10
                  }
                : f
            ))

            // If duplicate, show message and stop processing
            if (result.status === 'duplicate') {
              alert(`Duplicate file detected: ${result.message}`)
              setIsUploading(false)
              setCurrentFileId(null)
            }
          } else {
            throw new Error('Enhanced upload failed, falling back to regular upload')
          }
          
        } catch (enhancedError) {
          console.log('Enhanced upload failed, using regular upload:', enhancedError)
          
          // Fallback to regular upload
          try {
            const response = await fileUploadService.uploadFile(file, (progress: UploadProgress) => {
              setFiles(prev => prev.map(f => 
                f.id === tempId 
                  ? { 
                      ...f, 
                      id: progress.fileId !== 'uploading' ? progress.fileId : tempId,
                      progress: progress.progress,
                      status: progress.status,
                      processedRecords: progress.processedRecords,
                      errorMessage: progress.message
                    }
                  : f
              ))
            })
            
            // Update with final file ID
            setFiles(prev => prev.map(f => 
              f.id === tempId 
                ? { ...f, id: response.fileId }
                : f
            ))
            
          } catch (regularError) {
            setFiles(prev => prev.map(f => 
              f.id === tempId 
                ? { ...f, status: 'error', errorMessage: 'Upload failed' }
                : f
            ))
          }
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      if (!currentFileId) {
        setIsUploading(false)
      }
    }
  }, [currentFileId])

  const removeFile = async (fileId: string) => {
    try {
      // Remove from backend if it's a real file (not just a local error)
      const file = files.find(f => f.id === fileId)
      if (file && file.status !== 'error') {
        await fileUploadService.deleteFile(fileId)
      }
      
      // Remove from local state
      setFiles(prev => prev.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Error deleting file:', error)
      // Still remove from local state even if backend deletion fails
      setFiles(prev => prev.filter(f => f.id !== fileId))
    }
  }

  const handleFileUpload = useCallback(async (uploadFileList: FileList) => {
    try {
      await uploadFiles(uploadFileList)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }, [uploadFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('excel') || type.includes('spreadsheet')) {
      return <FileText className="w-5 h-5 text-green-600" />
    }
    if (type.includes('csv')) {
      return <FileText className="w-5 h-5 text-blue-600" />
    }
    if (type.includes('pdf')) {
      return <File className="w-5 h-5 text-red-600" />
    }
    return <File className="w-5 h-5 text-gray-600" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'duplicate':
        return <Layers className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-gray-600 mt-1">Upload files and manage your data schemas</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Supported formats: Excel, CSV, PDF, Word</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'uploads'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            File Uploads
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schemas'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Data Schemas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'uploads' && (
        <>
          {/* Real-time Processing Updates */}
      {agentUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              🤖 AI Processing Pipeline
            </h3>
            <div className="flex items-center space-x-3">
              {processingComplete && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              )}
              <button
                onClick={() => {
                  setCurrentFileId(null)
                  setAgentUpdates([])
                  setClassificationResult(null)
                  setProcessingComplete(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close processing view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {agentUpdates.map((update, index) => {
              const getAgentIcon = (agentName: string) => {
                if (agentName.includes('Validator')) return <CheckCircle2 className="w-4 h-4" />
                if (agentName.includes('Parser')) return <FileText className="w-4 h-4" />
                if (agentName.includes('Deduplication')) return <Eye className="w-4 h-4" />
                if (agentName.includes('AI') || agentName.includes('Classification')) return <Brain className="w-4 h-4" />
                if (agentName.includes('Ingestion')) return <Database className="w-4 h-4" />
                return <Zap className="w-4 h-4" />
              }

              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'completed': return 'text-green-600'
                  case 'processing': return 'text-blue-600'
                  case 'error': return 'text-red-600'
                  default: return 'text-gray-600'
                }
              }

              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex-shrink-0 ${getStatusColor(update.status)}`}>
                    {update.status === 'processing' ? (
                      <RefreshCw className="animate-spin w-4 h-4" />
                    ) : (
                      getAgentIcon(update.agent)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {update.agent}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        update.status === 'completed' ? 'bg-green-100 text-green-800' :
                        update.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        update.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      {update.message}
                    </p>
                    {update.data && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                            View Details
                          </summary>
                          <pre className="bg-white p-2 rounded border mt-1 text-xs overflow-x-auto">
                            {JSON.stringify(update.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Classification Results */}
      {classificationResult && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            🧠 AI Classification Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">Data Type</div>
              <div className="text-xl font-bold text-blue-700">
                {classificationResult.data_type || 'Unknown'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-semibold text-green-900">Confidence</div>
              <div className="text-xl font-bold text-green-700">
                {classificationResult.confidence ? 
                  `${(classificationResult.confidence * 100).toFixed(1)}%` : 'N/A'
                }
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm font-semibold text-purple-900">Method</div>
              <div className="text-xl font-bold text-purple-700">
                {classificationResult.method || 'AI Analysis'}
              </div>
            </div>
          </div>
          {classificationResult.reasoning && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm font-semibold text-gray-900 mb-2">AI Reasoning</div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {classificationResult.reasoning}
              </p>
            </div>
          )}
        </div>
      )}

      {/* WebSocket Connection Status */}
      {currentFileId && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-gray-700 font-medium">
                Real-time Updates: {connectionStatus}
              </span>
            </div>
            <div className="text-gray-500">
              Messages: {messages.length}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDragOver 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-primary-100' : 'bg-white shadow-sm'}
          `}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-primary-600' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop files here' : 'Upload your data files'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>Excel/CSV</span>
            </div>
            <div className="flex items-center space-x-1">
              <File className="w-3 h-3" />
              <span>PDF/Word</span>
            </div>
            <div className="flex items-center space-x-1">
              <Upload className="w-3 h-3" />
              <span>Max 100MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
            <p className="text-sm text-gray-600">{files.length} file(s) uploaded</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {getFileIcon(file.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {file.fileName}
                        </h4>
                        {getStatusIcon(file.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.uploadedAt.toLocaleTimeString()}</span>
                        {file.processedRecords && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              {file.processedRecords.toLocaleString()} records processed
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>
                              {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {file.errorMessage && (
                        <p className="mt-1 text-xs text-red-600">{file.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {file.status === 'completed' && (
                      <>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Files</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{files.length}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Processed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.status === 'completed').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Processing</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.status === 'uploading' || f.status === 'processing').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Errors</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.status === 'error').length}
            </p>
          </div>
        </div>
      )}
        </>
      )}

      {/* Schemas Tab Content */}
      {activeTab === 'schemas' && (
        <SchemaManager />
      )}
    </div>
  )
}