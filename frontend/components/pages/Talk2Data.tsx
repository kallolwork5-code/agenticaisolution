'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  FileText, 
  MessageCircle, 
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react'

interface DocumentInfo {
  id: string
  fileName: string
  classification: string
  uploadDate: string
  recordCount: number
  aiSummary: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

interface Talk2DataProps {
  onBack: () => void
}

const Talk2Data: React.FC<Talk2DataProps> = ({ onBack }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [showDocumentSelector, setShowDocumentSelector] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load available documents
  useEffect(() => {
    loadDocuments()
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true)
      const response = await fetch('http://localhost:8000/api/talk2data/documents')
      if (response.ok) {
        const docs = await response.json()
        setDocuments(docs)
      } else {
        console.error('Failed to load documents')
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/talk2data/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          selected_documents: selectedDocuments
        })
      })

      if (response.ok) {
        const result = await response.json()
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.response,
          timestamp: new Date(result.timestamp),
          sources: result.sources
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your message. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.classification.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-b border-green-500/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Talk 2 Data</h1>
                <p className="text-green-300 text-sm">Chat with your uploaded documents</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/60">
              {selectedDocuments.length} of {documents.length} documents selected
            </div>
            <button
              onClick={() => setShowDocumentSelector(!showDocumentSelector)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Documents</span>
              {showDocumentSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-120px)] flex gap-6">
        {/* Document Selector Panel */}
        <AnimatePresence>
          {showDocumentSelector && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Select Documents</h3>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Select All / Clear All */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setSelectedDocuments(filteredDocuments.map(d => d.id))}
                    className="flex-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedDocuments([])}
                    className="flex-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
                {isLoadingDocuments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                    <span className="ml-2 text-white/60">Loading documents...</span>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-white/30" />
                    <p>No documents found</p>
                    <p className="text-sm mt-1">Upload documents in Data Management first</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedDocuments.includes(doc.id)
                            ? 'bg-green-500/20 border-green-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => handleDocumentToggle(doc.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-white truncate">
                                {doc.fileName}
                              </span>
                            </div>
                            <div className="text-xs text-white/60 mb-2">
                              {doc.classification} • {doc.recordCount} records
                            </div>
                            <p className="text-xs text-white/50 line-clamp-2">
                              {doc.aiSummary}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {selectedDocuments.includes(doc.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-white/60 mb-4 max-w-md">
                  Select documents from the panel and ask questions about their content. 
                  I'll analyze the documents and provide detailed answers.
                </p>
                {selectedDocuments.length === 0 && (
                  <p className="text-yellow-400 text-sm">
                    💡 Select at least one document to get started
                  </p>
                )}
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.type === 'user' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/10 text-white'
                    } rounded-lg p-4`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-green-100' : 'text-white/60'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="text-xs text-white/60 mb-1">Sources:</div>
                          <div className="text-xs text-white/80 space-y-1">
                            {message.sources.slice(0, 2).map((source, idx) => (
                              <div key={idx} className="bg-white/10 rounded p-2">
                                {source.substring(0, 100)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/10 text-white rounded-lg p-4 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing documents...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedDocuments.length === 0 ? "Select documents first..." : "Ask a question about your documents..."}
                  disabled={selectedDocuments.length === 0 || isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || selectedDocuments.length === 0 || isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {selectedDocuments.length > 0 && (
              <div className="mt-2 text-xs text-white/60">
                Chatting with {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Talk2Data