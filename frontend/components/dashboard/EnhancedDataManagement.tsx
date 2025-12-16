'use client'

import { useCallback, useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2,
  RefreshCw,
  Database,
  Layers,
  Bot,
  Zap,
  Brain,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react'
import { enhancedFileUploadService, EnhancedUploadProgress } from '@/lib/services/EnhancedFileUploadService'

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
  classification?: {
    data_type: string
    confidence: number
    reasoning: string
    method: string
  }
  agentUpdates?: any[]
  insights?: any
}

interface EnhancedDataManagementProps {
  className?: string
}

export default function EnhancedDataManagement({ className = '' }: EnhancedDataManagementProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // Load existing files on component mount
  useEffect(() => {
    loadExistingFiles()
    
    // Cleanup WebSocket connections on unmount
    return () => {
      enhancedFileUploadService.disconnectAll()
    }
  }, [])

  const loadExistingFiles = async () => {
    try {
      const existingFiles = await enhancedFileUploadService.getUploadedFiles()
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
    
    try {
      for (const file of Array.from(uploadFileList)) {
        // Validate file first
        const validation = enhancedFileUploadService.validateFile(file)
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
          uploadedAt: new Date(),
          agentUpdates: []
        }
        
        setFiles(prev => [...prev, newFile])
        
        // Upload using enhanced service with real-time updates
        try {
          const response = await enhancedFileUploadService.uploadFile(file, (progress: EnhancedUploadProgress) => {
            setFiles(prev => prev.map(f => 
              f.id === tempId 
                ? { 
                    ...f, 
                    id: progress.fileId !== 'uploading' ? progress.fileId : tempId,
                    progress: progress.progress,
                    status: progress.status,
                    processedRecords: progress.agentUpdates.length,
                    errorMessage: progress.status === 'error' ? progress.message : undefined,
                    classification: progress.classification,
                    agentUpdates: progress.agentUpdates,
                    insights: progress.insights
                  }
                : f
            ))
          })
          
          // Update with final file ID
          setFiles(prev => prev.map(f => 
            f.id === tempId 
              ? { ...f, id: response.file_id }
              : f
          ))
          
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === tempId 
              ? { ...f, status: 'error', errorMessage: 'Upload failed' }
              : f
          ))
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const removeFile = async (fileId: string) => {
    try {
      await enhancedFileUploadService.deleteFile(fileId)
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

  const getClassificationIcon = (method?: string) => {
    if (method === 'rule-based') {
      return <Zap className="w-4 h-4 text-yellow-500" />
    } else if (method === 'llm') {
      return <Brain className="w-4 h-4 text-purple-500" />
    }
    return <Bot className="w-4 h-4 text-blue-500" />
  }

  const getLatestAgentUpdate = (file: UploadedFile) => {
    if (!file.agentUpdates || file.agentUpdates.length === 0) return null
    return file.agentUpdates[file.agentUpdates.length - 1]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-green-600" />
            Enhanced Data Management
          </h2>
          <p className="text-gray-600 mt-1">AI-powered file processing with real-time agentic behavior</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Real-time AI processing</span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-green-100' : 'bg-white shadow-sm'}
          `}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragOver ? 'Drop files here' : 'Upload for AI Analysis'}
            </h3>
            <p className="text-gray-600 mb-4">
              Experience intelligent file processing with real-time agent updates
            </p>
            
            <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <Bot className="w-4 h-4 mr-2" />
              Start AI Processing
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
              <Zap className="w-3 h-3" />
              <span>Rule-based Classification</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>AI Fallback</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* File List with Enhanced Information */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Processing Queue
            </h3>
            <p className="text-sm text-gray-600">{files.length} file(s) in processing pipeline</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((file) => {
              const latestUpdate = getLatestAgentUpdate(file)
              
              return (
                <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getFileIcon(file.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {file.fileName}
                          </h4>
                          {getStatusIcon(file.status)}
                          {file.classification && getClassificationIcon(file.classification.method)}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadedAt.toLocaleTimeString()}</span>
                          {file.processedRecords && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">
                                {file.processedRecords} agent updates
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Classification Information */}
                        {file.classification && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="font-medium text-blue-800">
                                Classified as: {file.classification.data_type}
                              </span>
                              <span className="text-blue-600">
                                ({Math.round(file.classification.confidence * 100)}% confidence)
                              </span>
                              <span className="text-blue-500">
                                via {file.classification.method}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                              {file.classification.reasoning}
                            </p>
                          </div>
                        )}
                        
                        {/* Latest Agent Update */}
                        {latestUpdate && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-xs">
                              <Bot className="w-3 h-3 text-green-600" />
                              <span className="font-medium text-green-800">
                                {latestUpdate.agent || 'Agent'}
                              </span>
                              <span className="text-green-600">
                                {latestUpdate.status}
                              </span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              {latestUpdate.message}
                            </p>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        {(file.status === 'uploading' || file.status === 'processing') && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {latestUpdate?.agent || 'Processing'}...
                              </span>
                              <span>{file.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {file.errorMessage && (
                          <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            {file.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {file.status === 'completed' && (
                        <>
                          <button 
                            onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {file.insights && (
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          )}
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
                  
                  {/* Expanded Details */}
                  {selectedFile === file.id && file.agentUpdates && (
                    <div className="mt-4 border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Agent Processing Timeline</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {file.agentUpdates.map((update, index) => (
                          <div key={index} className="flex items-start space-x-2 text-xs">
                            <span className="text-gray-500 w-16">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </span>
                            <div className="flex-1">
                              <span className="font-medium text-gray-700">
                                {update.agent}:
                              </span>
                              <span className="text-gray-600 ml-1">
                                {update.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Enhanced Statistics */}
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
              <span className="text-sm font-medium text-gray-600">AI Processed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.status === 'completed').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">AI Classifications</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.classification?.method === 'llm').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Rule-based</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {files.filter(f => f.classification?.method === 'rule-based').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}