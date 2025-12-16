'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Database, 
  FileSpreadsheet, 
  FileText, 
  File,
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'

interface DataInsight {
  type: 'pattern' | 'quality' | 'recommendation' | 'anomaly'
  title: string
  description: string
  confidence: number
  actionable: boolean
}

interface UploadHistoryItem {
  id: string
  fileName: string
  fileSize: number
  uploadDate: Date
  classification: string
  storageLocation: 'sqlite' | 'chromadb'
  recordCount: number
  status: 'success' | 'failed' | 'processing'
  aiSummary?: string
  insights?: DataInsight[]
}

interface UploadHistoryProps {
  items: UploadHistoryItem[]
  onItemClick?: (item: UploadHistoryItem) => void
  onGenerateInsights?: (item: UploadHistoryItem) => void
  className?: string
}

const UploadHistory: React.FC<UploadHistoryProps> = ({
  items,
  onItemClick,
  onGenerateInsights,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState<UploadHistoryItem | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState<string | null>(null)

  // Get file icon based on filename
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-4 h-4" />
      case 'json':
        return <FileText className="w-4 h-4" />
      case 'txt':
        return <File className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: UploadHistoryItem['status']) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Success
          </div>
        )
      case 'processing':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Processing
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Failed
          </div>
        )
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Handle item click
  const handleItemClick = (item: UploadHistoryItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item)
    onItemClick?.(item)
  }

  // Generate insights for an item using LangChain
  const handleGenerateInsights = async (item: UploadHistoryItem) => {
    setIsGeneratingInsights(item.id)
    
    try {
      // Call backend API to generate insights using LangChain
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: item.fileName,
          fileSize: item.fileSize,
          classification: item.classification,
          storageLocation: item.storageLocation,
          recordCount: item.recordCount
        })
      })
      
      if (response.ok) {
        const insights = await response.json()
        // Update the item with real insights from LangChain
        onGenerateInsights?.(item)
        setShowInsights(item.id)
      } else {
        console.error('Failed to generate insights:', response.statusText)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGeneratingInsights(null)
    }
  }

  // Get insight icon
  const getInsightIcon = (type: DataInsight['type']) => {
    switch (type) {
      case 'pattern':
        return <TrendingUp className="w-4 h-4" />
      case 'quality':
        return <CheckCircle className="w-4 h-4" />
      case 'recommendation':
        return <Lightbulb className="w-4 h-4" />
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  // Get insight color
  const getInsightColor = (type: DataInsight['type']) => {
    switch (type) {
      case 'pattern':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'quality':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'recommendation':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'anomaly':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
    }
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold text-lg">Upload History</h3>
          <span className="text-white/60 text-sm">({items.length} files)</span>
        </div>
        <button className="text-green-400 hover:text-green-300 text-sm transition-colors">
          View All
        </button>
      </div>

      {/* History Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No upload history yet</p>
            <p className="text-white/30 text-xs">Upload your first file to get started</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              {/* Main Item */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-green-400">
                      {getFileIcon(item.fileName)}
                    </div>
                    <span className="text-white font-medium text-sm truncate">
                      {item.fileName}
                    </span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="flex justify-between text-xs text-white/60 mb-2">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{item.recordCount.toLocaleString()} records</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>{item.storageLocation}</span>
                  </div>
                </div>
                
                {item.aiSummary && (
                  <div className="mt-2 text-xs text-green-400 italic">
                    "AI: {item.aiSummary.substring(0, 60)}..."
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {selectedItem?.id === item.id && (
                  <motion.div
                    className="border-t border-white/10 bg-white/5"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4">
                      {/* Item Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-white/60">Classification</p>
                          <p className="text-white font-medium">{item.classification}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Storage</p>
                          <p className="text-white font-medium capitalize">{item.storageLocation}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mb-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs">
                          <Eye className="w-3 h-3" />
                          View Data
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs">
                          <Download className="w-3 h-3" />
                          Export
                        </button>
                        <button 
                          onClick={() => handleGenerateInsights(item)}
                          disabled={isGeneratingInsights === item.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs disabled:opacity-50"
                        >
                          <Brain className="w-3 h-3" />
                          {isGeneratingInsights === item.id ? 'Generating...' : 'AI Insights'}
                        </button>
                      </div>

                      {/* AI Summary */}
                      {item.aiSummary && (
                        <div className="mb-4">
                          <h4 className="text-white font-medium text-sm mb-2">AI Summary</h4>
                          <p className="text-white/70 text-sm bg-white/5 rounded-lg p-3">
                            {item.aiSummary}
                          </p>
                        </div>
                      )}

                      {/* Insights */}
                      {showInsights === item.id && item.insights && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <h4 className="text-white font-medium text-sm mb-3">Data Insights</h4>
                          <div className="space-y-2">
                            {item.insights.map((insight, index) => (
                              <div 
                                key={index}
                                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  {getInsightIcon(insight.type)}
                                  <span className="font-medium text-sm">{insight.title}</span>
                                  <span className="text-xs opacity-70">
                                    {Math.round(insight.confidence * 100)}%
                                  </span>
                                </div>
                                <p className="text-sm opacity-80">{insight.description}</p>
                                {insight.actionable && (
                                  <div className="mt-2">
                                    <span className="text-xs px-2 py-1 bg-white/10 rounded">
                                      Actionable
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {items.length > 0 && (
        <motion.div
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">
                {items.filter(item => item.status === 'success').length}
              </p>
              <p className="text-xs text-white/60">Successful</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {items.reduce((acc, item) => acc + item.recordCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-white/60">Total Records</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">
                {formatFileSize(items.reduce((acc, item) => acc + item.fileSize, 0))}
              </p>
              <p className="text-xs text-white/60">Total Size</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default UploadHistory