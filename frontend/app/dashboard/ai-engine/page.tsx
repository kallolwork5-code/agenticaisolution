'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Brain, Send, Sparkles, MessageCircle, FileText, BarChart3, AlertCircle, Database, FileIcon, Loader2 } from 'lucide-react'

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysis?: any
  data_sources?: string[]
}

interface SampleQuery {
  category: string
  queries: string[]
}

export default function AIEnginePage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for CollectiSense. I can help you analyze your transaction data, generate insights, and answer questions about your financial metrics. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [sampleQueries, setSampleQueries] = useState<SampleQuery[]>([])
  const [dataSummary, setDataSummary] = useState<any>(null)
  const [aiStatus, setAiStatus] = useState<any>(null)

  // Load initial data
  useEffect(() => {
    loadSampleQueries()
    loadDataSummary()
    checkAIStatus()
  }, [])

  const loadSampleQueries = async () => {
    try {
      const response = await fetch('/api/ai-engine/sample-queries')
      if (response.ok) {
        const data = await response.json()
        setSampleQueries(data.sample_queries || [])
      }
    } catch (error) {
      console.error('Failed to load sample queries:', error)
      // Fallback to default queries
      setSampleQueries([
        {
          category: "Transaction Analysis",
          queries: [
            "What's my average transaction cost this month?",
            "Show me transactions with high MDR rates",
            "Which acquirer has the best performance?",
            "Analyze my SLA compliance trends"
          ]
        }
      ])
    }
  }

  const loadDataSummary = async () => {
    try {
      const response = await fetch('/api/ai-engine/data-summary')
      if (response.ok) {
        const data = await response.json()
        setDataSummary(data.data_summary)
      }
    } catch (error) {
      console.error('Failed to load data summary:', error)
    }
  }

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai-engine/health')
      if (response.ok) {
        const data = await response.json()
        setAiStatus(data)
      }
    } catch (error) {
      console.error('Failed to check AI status:', error)
      setAiStatus({ status: 'error', ai_agent_available: false })
    }
  }

  const handleSendQuery = async () => {
    if (!query.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    const currentQuery = query
    setQuery('')

    try {
      const response = await fetch('/api/ai-engine/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentQuery,
          context: {}
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const aiResponse: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: data.response || 'I apologize, but I couldn\'t process your query at this time.',
          timestamp: new Date(),
          analysis: data.analysis,
          data_sources: data.data_sources
        }

        setMessages(prev => [...prev, aiResponse])
      } else {
        const errorData = await response.json()
        const errorResponse: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: `I encountered an error: ${errorData.detail || 'Unable to process your query'}. Please try again or check if the AI service is properly configured.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('Query failed:', error)
      const errorResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'I\'m having trouble connecting to the AI service. Please check your connection and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
  }

  return (
    <DashboardLayout
      title="AI Engine"
      description="Natural language queries and intelligent insights for your transaction data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-sm text-gray-600">Ask questions about your transaction data</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.data_sources && message.data_sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Data sources used:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.data_sources.map((source, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {source === 'structured_data' ? (
                              <Database className="w-3 h-3 mr-1" />
                            ) : (
                              <FileIcon className="w-3 h-3 mr-1" />
                            )}
                            {source.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-gray-100 text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">AI is thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder="Ask me anything about your transaction data..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSendQuery}
                disabled={!query.trim()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 text-purple-600 mr-2" />
              AI Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    aiStatus?.status === 'healthy' ? 'bg-green-500' : 
                    aiStatus?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    aiStatus?.status === 'healthy' ? 'text-green-600' : 
                    aiStatus?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {aiStatus?.status === 'healthy' ? 'Online' : 
                     aiStatus?.status === 'degraded' ? 'Limited' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OpenAI API</span>
                <span className={`text-sm font-medium ${
                  aiStatus?.openai_configured ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiStatus?.openai_configured ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sources</span>
                <span className="text-sm font-medium text-gray-900">
                  {dataSummary ? `${dataSummary.total_tables + dataSummary.total_documents}` : '0'} Available
                </span>
              </div>
            </div>
            {!aiStatus?.ai_agent_available && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Setup Required</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Configure your OpenAI API key to enable AI features
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Summary */}
          {dataSummary && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 text-blue-600 mr-2" />
                Available Data
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Tables</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dataSummary.total_tables}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Collections</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dataSummary.total_documents}
                  </span>
                </div>
                {dataSummary.structured_data?.tables && dataSummary.structured_data.tables.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Available Tables:</p>
                    <div className="space-y-1">
                      {dataSummary.structured_data.tables.slice(0, 3).map((table: any, index: number) => (
                        <div key={index} className="text-xs text-gray-700 flex items-center space-x-2">
                          <Database className="w-3 h-3" />
                          <span>{table.name} ({table.row_count} rows)</span>
                        </div>
                      ))}
                      {dataSummary.structured_data.tables.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{dataSummary.structured_data.tables.length - 3} more tables
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggested Queries */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
              Suggested Queries
            </h4>
            {sampleQueries.length > 0 ? (
              <div className="space-y-4">
                {sampleQueries.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">{category.category}</h5>
                    <div className="space-y-1">
                      {category.queries.slice(0, 2).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuery(suggestion)}
                          className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleSuggestedQuery("What's my average transaction cost this month?")}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  What's my average transaction cost this month?
                </button>
                <button
                  onClick={() => handleSuggestedQuery("Show me transactions with high MDR rates")}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Show me transactions with high MDR rates
                </button>
                <button
                  onClick={() => handleSuggestedQuery("Which acquirer has the best performance?")}
                  className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Which acquirer has the best performance?
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={() => handleSuggestedQuery("Generate a summary report of all my transaction data")}
                className="w-full flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Generate Report</span>
              </button>
              <button 
                onClick={() => handleSuggestedQuery("Show me key analytics and metrics for my transactions")}
                className="w-full flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span>View Analytics</span>
              </button>
              <button 
                onClick={() => {
                  const chatContent = messages.map(m => `${m.type.toUpperCase()}: ${m.content}`).join('\n\n')
                  const blob = new Blob([chatContent], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `collectisense-chat-${new Date().toISOString().split('T')[0]}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span>Export Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}