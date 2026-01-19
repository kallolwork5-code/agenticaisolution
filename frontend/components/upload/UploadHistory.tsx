'use client'

import React, { useState, useEffect } from 'react'
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
  Lightbulb,
  X
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
  const [showFullSummary, setShowFullSummary] = useState<string | null>(null)
  const [fullSummaryContent, setFullSummaryContent] = useState<string>('')

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFullSummary) {
          setShowFullSummary(null)
        }
        if (showInsights) {
          setShowInsights(null)
        }
      }
    }

    // Always add the event listener when component mounts
    document.addEventListener('keydown', handleEscKey)
    
    // Cleanup on unmount
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [showFullSummary, showInsights])

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
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-400" />
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

  // Handle viewing full document summary
  const handleViewFullSummary = async (item: UploadHistoryItem) => {
    try {
      const response = await fetch(`http://localhost:8000/api/upload/summary/${item.id}`)
      if (response.ok) {
        const summaryData = await response.json()
        setFullSummaryContent(summaryData.summary)
        setShowFullSummary(item.id)
      } else {
        console.error('Failed to fetch full summary:', response.statusText)
        alert('Failed to load document summary')
      }
    } catch (error) {
      console.error('Error fetching full summary:', error)
      alert('Error loading document summary')
    }
  }

  // Handle downloading document summary
  const handleDownloadSummary = async (item: UploadHistoryItem) => {
    try {
      const response = await fetch(`http://localhost:8000/api/upload/summary/${item.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Try to get filename from Content-Disposition header, fallback to generated name
        const contentDisposition = response.headers.get('content-disposition')
        let filename = `${item.fileName.split('.')[0]}_summary.docx` // Default to .docx
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
          if (filenameMatch) {
            filename = filenameMatch[1].replace(/['"]/g, '') // Remove quotes
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download summary:', response.statusText)
        alert('Failed to download document summary')
      }
    } catch (error) {
      console.error('Error downloading summary:', error)
      alert('Error downloading document summary')
    }
  }

  // Format LLM summary content for better display
  const formatSummaryContent = (content: string): string => {
    if (!content) return ''
    
    return content
      // First, handle section headers and structure
      .replace(/^([A-Z\s]+)$/gm, '<h2 class="text-xl font-bold text-green-300 mb-4 mt-6 pb-2 border-b border-green-500/30">$1</h2>')
      
      // Handle document metadata structure
      .replace(/^(Document|Date|Model|Validator):\s*(.+)$/gm, 
        '<div class="flex items-start gap-3 mb-2 p-3 bg-white/5 rounded-lg border-l-4 border-blue-400">' +
        '<span class="font-semibold text-blue-300 min-w-[100px]">$1:</span>' +
        '<span class="text-white/90">$2</span>' +
        '</div>')
      
      // Handle key findings with bullet points
      .replace(/^>\s*(.+)$/gm, 
        '<div class="flex items-start gap-3 mb-3 p-4 bg-green-500/10 rounded-lg border-l-4 border-green-400">' +
        '<span class="text-green-400 text-lg">▶</span>' +
        '<span class="text-white/90 font-medium">$1</span>' +
        '</div>')
      
      // Handle critical points or important sections
      .replace(/^(Critical Points?|Key Findings?|Executive Summary|Overall Assessment)$/gim,
        '<h3 class="text-lg font-semibold text-yellow-300 mb-3 mt-5 flex items-center gap-2">' +
        '<span class="w-2 h-2 bg-yellow-400 rounded-full"></span>$1</h3>')
      
      // Convert markdown headers
      .replace(/^### (.+)$/gm, '<h4 class="text-base font-medium text-blue-300 mb-2 mt-4">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold text-green-300 mb-3 mt-5">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="text-xl font-bold text-white mb-4 mt-6 border-b border-white/20 pb-2">$1</h2>')
      
      // Remove markdown bold/italic and replace with HTML
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-green-300">$1</em>')
      
      // Handle tables better
      .replace(/^\|(.+)\|$/gm, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell)
        if (cells.length === 0) return ''
        
        const isHeaderSeparator = content.includes('---') || content.includes('===')
        if (isHeaderSeparator) return '' // Skip separator rows
        
        const cellsHtml = cells.map(cell => 
          `<div class="px-3 py-2 text-sm">${cell}</div>`
        ).join('')
        
        return `<div class="flex bg-white/5 border border-white/10 rounded-lg mb-1 overflow-hidden">${cellsHtml}</div>`
      })
      
      // Handle bullet points and lists
      .replace(/^[-*]\s+(.+)$/gm, 
        '<div class="flex items-start gap-3 mb-2 ml-4">' +
        '<span class="text-green-400 mt-1 text-sm">●</span>' +
        '<span class="text-white/90">$1</span>' +
        '</div>')
      
      // Handle numbered lists
      .replace(/^(\d+)\.\s+(.+)$/gm, 
        '<div class="flex items-start gap-3 mb-2 ml-4">' +
        '<span class="text-blue-400 font-medium min-w-[24px] text-sm">$1.</span>' +
        '<span class="text-white/90">$2</span>' +
        '</div>')
      
      // Handle code blocks
      .replace(/```([\s\S]*?)```/g, 
        '<div class="bg-black/40 border border-white/20 rounded-lg p-4 my-4 font-mono text-sm text-green-300 overflow-x-auto whitespace-pre">$1</div>')
      .replace(/`([^`]+)`/g, 
        '<code class="bg-white/10 px-2 py-1 rounded text-green-300 font-mono text-sm">$1</code>')
      
      // Handle line breaks and spacing
      .replace(/\n\s*\n\s*\n/g, '<div class="h-4"></div>') // Triple line breaks = larger space
      .replace(/\n\s*\n/g, '<div class="h-2"></div>') // Double line breaks = smaller space
      .replace(/\n/g, '<br/>') // Single line breaks
      
      // Clean up any remaining issues
      .replace(/^\s*<br\/>\s*/gm, '') // Remove leading breaks
      .replace(/\s*<br\/>\s*$/gm, '') // Remove trailing breaks
  }
  const handleGenerateInsights = async (item: UploadHistoryItem) => {
    setIsGeneratingInsights(item.id)
    
    try {
      // Call backend API to generate insights using LangChain
      const response = await fetch('http://localhost:8000/api/insights/generate', {
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
        alert('Failed to generate insights. Please try again.')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      alert('Error generating insights. Please check your connection.')
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
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>{item.storageLocation}</span>
                    </div>
                    {/* Quick AI Insights button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateInsights(item)
                      }}
                      disabled={isGeneratingInsights === item.id}
                      className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors disabled:opacity-50 text-xs"
                      title="Generate AI Insights"
                    >
                      <Brain className="w-3 h-3" />
                      <span className="text-xs">
                        {isGeneratingInsights === item.id ? 'AI...' : 'AI'}
                      </span>
                    </button>
                    {/* Show existing insights indicator */}
                    {item.insights && item.insights.length > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowInsights(showInsights === item.id ? null : item.id)
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors text-xs"
                        title={`${showInsights === item.id ? 'Hide' : 'Show'} ${item.insights.length} insights`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">{item.insights.length}</span>
                      </button>
                    )}
                    {/* Document-specific buttons */}
                    {item.classification === 'document' && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewFullSummary(item)
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs"
                          title="View Full Summary"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">View</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadSummary(item)
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-xs"
                          title="Download Word Document"
                        >
                          <Download className="w-3 h-3" />
                          <span className="text-xs">Doc</span>
                        </button>
                      </>
                    )}
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
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs">
                          <Eye className="w-3 h-3" />
                          View Data
                        </button>
                        {item.classification === 'document' ? (
                          <>
                            <button 
                              onClick={() => handleViewFullSummary(item)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs"
                            >
                              <FileText className="w-3 h-3" />
                              View Summary
                            </button>
                            <button 
                              onClick={() => handleDownloadSummary(item)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download Summary
                            </button>
                          </>
                        ) : (
                          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs">
                            <Download className="w-3 h-3" />
                            Export
                          </button>
                        )}
                        <button 
                          onClick={() => handleGenerateInsights(item)}
                          disabled={isGeneratingInsights === item.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-xs disabled:opacity-50"
                        >
                          <Brain className="w-3 h-3" />
                          {isGeneratingInsights === item.id ? 'Generating...' : 'AI Insights'}
                        </button>
                        {/* Toggle existing insights if they exist */}
                        {item.insights && item.insights.length > 0 && (
                          <button 
                            onClick={() => setShowInsights(showInsights === item.id ? null : item.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs"
                          >
                            <TrendingUp className="w-3 h-3" />
                            {showInsights === item.id ? 'Hide' : 'Show'} Insights ({item.insights.length})
                          </button>
                        )}
                      </div>

                      {/* AI Summary */}
                      {item.aiSummary && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium text-sm">AI Summary</h4>
                            {item.classification === 'document' && (
                              <button
                                onClick={() => handleViewFullSummary(item)}
                                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                              >
                                View Full Summary
                              </button>
                            )}
                          </div>
                          <p className="text-white/70 text-sm bg-white/5 rounded-lg p-3">
                            {item.classification === 'document' 
                              ? `${item.aiSummary.substring(0, 150)}...` 
                              : item.aiSummary.length > 200 
                                ? `${item.aiSummary.substring(0, 200)}...`
                                : item.aiSummary
                            }
                          </p>
                        </div>
                      )}

                      {/* Insights - Improved Visibility */}
                      {showInsights === item.id && item.insights && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 rounded-xl p-4 border border-white/20"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-semibold text-base flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-yellow-400" />
                              Data Insights ({item.insights.length})
                            </h4>
                            <button
                              onClick={() => setShowInsights(null)}
                              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="grid gap-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                            {item.insights.map((insight, index) => (
                              <div 
                                key={index}
                                className={`p-4 rounded-xl border-2 ${getInsightColor(insight.type)} backdrop-blur-sm`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 rounded-lg bg-white/10">
                                    {getInsightIcon(insight.type)}
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-semibold text-base block">{insight.title}</span>
                                    <span className="text-sm opacity-80">
                                      Confidence: {Math.round(insight.confidence * 100)}%
                                    </span>
                                  </div>
                                  {insight.actionable && (
                                    <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-medium">
                                      Actionable
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed opacity-90">{insight.description}</p>
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

      {/* Full Summary Modal - Guaranteed Centering */}
      <AnimatePresence>
        {showFullSummary && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
              onClick={() => setShowFullSummary(null)}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[9999] pointer-events-none">
              <div className="h-full w-full flex items-center justify-center p-4">
                <motion.div
                  className="relative bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header with Prominent Close Button */}
                  <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Document Summary</h2>
                        <p className="text-white/70 text-sm">
                          {items.find(item => item.id === showFullSummary)?.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const item = items.find(item => item.id === showFullSummary)
                          if (item) handleDownloadSummary(item)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => setShowFullSummary(null)}
                        className="w-12 h-12 rounded-lg bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        title="Close Modal"
                      >
                        <X className="w-6 h-6 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-800/50">
                    <div className="max-w-none">
                      <div 
                        className="text-white/90 leading-relaxed space-y-4"
                        style={{ 
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          lineHeight: '1.6'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: formatSummaryContent(fullSummaryContent)
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer with Close Instructions */}
                  <div className="px-6 py-4 border-t border-white/20 bg-slate-800/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Generated by CollectiSense AI</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white/50">Press ESC or click outside to close</span>
                        <button
                          onClick={() => setShowFullSummary(null)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded border border-red-500/30 transition-colors text-xs"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UploadHistory