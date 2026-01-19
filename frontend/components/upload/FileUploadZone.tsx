'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void
  acceptedTypes?: string[]
  maxSize?: number
  isUploading?: boolean
  className?: string
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedTypes = ['.csv', '.xlsx', '.xls', '.json', '.txt'],
  maxSize = 50 * 1024 * 1024, // 50MB
  isUploading = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
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
    // Simple validation and pass to parent
    const validFiles: File[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validation = validateFile(file)
      
      if (validation.valid) {
        validFiles.push(file)
      } else {
        console.warn(`File ${file.name} rejected: ${validation.error}`)
      }
    }
    
    if (validFiles.length > 0) {
      const fileList = new DataTransfer()
      validFiles.forEach(file => fileList.items.add(file))
      onFileSelect(fileList.files)
    }
  }, [validateFile, onFileSelect])

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

  return (
    <div className={`${className}`}>
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
            <p>📊 Data files: CSV, Excel, JSON | 📄 Documents: PDF, Word, Text</p>
            <p>Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
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
    </div>
  )
}

export default FileUploadZone