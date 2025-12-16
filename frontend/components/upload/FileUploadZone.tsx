'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  File, 
  FileSpreadsheet, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Eye
} from 'lucide-react'

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void
  acceptedTypes?: string[]
  maxSize?: number
  maxFiles?: number
  isUploading?: boolean
  className?: string
}

interface FilePreview {
  file: File
  id: string
  status: 'pending' | 'valid' | 'invalid'
  error?: string
  preview?: string
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedTypes = ['.csv', '.xlsx', '.xls', '.json', '.txt'],
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 5,
  isUploading = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit` 
      }
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `File type ${fileExtension} not supported. Accepted: ${acceptedTypes.join(', ')}` 
      }
    }

    return { valid: true }
  }, [acceptedTypes, maxSize])

  // Handle file selection
  const handleFileSelection = useCallback((files: FileList) => {
    const newFiles: FilePreview[] = []
    
    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i]
      const validation = validateFile(file)
      
      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${i}`,
        status: validation.valid ? 'valid' : 'invalid',
        error: validation.error
      })
    }

    setSelectedFiles(newFiles)
    
    // Only pass valid files to parent
    const validFiles = newFiles.filter(f => f.status === 'valid').map(f => f.file)
    if (validFiles.length > 0) {
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))
      onFileSelect(fileList.files)
    }
  }, [validateFile, maxFiles, onFileSelect])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelection(files)
    }
  }, [handleFileSelection])

  // Remove file from selection
  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5" />
      case 'json':
        return <FileText className="w-5 h-5" />
      case 'txt':
        return <File className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300
          ${isDragOver 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-white/20 bg-white/5 hover:border-green-500/50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="text-center">
          <motion.div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDragOver ? 'bg-green-500' : 'bg-green-500/20'
            }`}
            animate={{ 
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-black' : 'text-green-400'}`} />
          </motion.div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Your Data'}
          </h3>
          
          <p className="text-white/60 mb-4">
            Drag & drop files or click to browse
          </p>
          
          <div className="text-white/40 text-sm space-y-1">
            <p>Supported formats: {acceptedTypes.join(', ')}</p>
            <p>Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
            <p>Maximum files: {maxFiles}</p>
          </div>

          {!isDragOver && (
            <motion.button
              className="mt-6 bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isUploading}
            >
              Select Files
            </motion.button>
          )}
        </div>

        {/* Loading overlay */}
        {isUploading && (
          <motion.div
            className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-white text-sm">Processing files...</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Selected Files Preview */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Selected Files ({selectedFiles.length})</h4>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-green-400 hover:text-green-300 text-sm flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Details
              </button>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((filePreview) => (
                <motion.div
                  key={filePreview.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${filePreview.status === 'valid' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`
                      ${filePreview.status === 'valid' ? 'text-green-400' : 'text-red-400'}
                    `}>
                      {getFileIcon(filePreview.file.name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {filePreview.file.name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>{formatFileSize(filePreview.file.size)}</span>
                        <span>{filePreview.file.type || 'Unknown type'}</span>
                      </div>
                      {filePreview.error && (
                        <p className="text-red-400 text-xs mt-1">{filePreview.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {filePreview.status === 'valid' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    
                    <button
                      onClick={() => removeFile(filePreview.id)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* File Statistics */}
            {showPreview && (
              <motion.div
                className="mt-4 pt-4 border-t border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {selectedFiles.filter(f => f.status === 'valid').length}
                    </p>
                    <p className="text-white/60 text-sm">Valid Files</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400">
                      {selectedFiles.filter(f => f.status === 'invalid').length}
                    </p>
                    <p className="text-white/60 text-sm">Invalid Files</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.file.size, 0))}
                    </p>
                    <p className="text-white/60 text-sm">Total Size</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUploadZone