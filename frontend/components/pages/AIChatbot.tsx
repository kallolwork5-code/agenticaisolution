'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Bot,
  Send,
  Loader2,
  History,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Search,
  Plus,
  Moon,
  Sun,
  Download,
  X
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  reactions?: MessageReaction[]
  quickActions?: QuickAction[]
}

interface MessageReaction {
  type: 'thumbs_up' | 'thumbs_down'
  timestamp: Date
}

interface QuickAction {
  label: string
  action: string
  icon: string
}

interface SavedConversation {
  id: string
  title: string
  messages: Message[]
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface AIChatbotProps {
  onBack: () => void
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<SavedConversation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatbot-conversations')
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations)
        setConversations(parsed)
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }

    const savedTheme = localStorage.getItem('chatbot-theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Auto-save conversations when messages change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      saveCurrentConversation()
    }
  }, [messages, conversationId])

  const saveCurrentConversation = useCallback(() => {
    if (!conversationId || messages.length === 0) return

    const conversation: SavedConversation = {
      id: conversationId,
      title: generateConversationTitle(messages),
      messages: messages,
      lastMessage: messages[messages.length - 1]?.content || '',
      timestamp: new Date(),
      messageCount: messages.length
    }

    setConversations(prev => {
      const updated = prev.filter(c => c.id !== conversationId)
      const newConversations = [conversation, ...updated].slice(0, 50) // Keep last 50 conversations
      localStorage.setItem('chatbot-conversations', JSON.stringify(newConversations))
      return newConversations
    })
  }, [conversationId, messages])

  const generateConversationTitle = (msgs: Message[]): string => {
    const firstUserMessage = msgs.find(m => m.type === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
    return `Conversation ${new Date().toLocaleDateString()}`
  }

  const loadConversation = (conversation: SavedConversation) => {
    setMessages(conversation.messages)
    setConversationId(conversation.id)
    setShowHistory(false)
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationId(null)
    setShowHistory(false)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('chatbot-theme', newTheme)
  }

  const addReaction = (messageId: string, reactionType: 'thumbs_up' | 'thumbs_down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.type === reactionType)
        if (existingReaction) {
          // Remove reaction if it already exists
          return {
            ...msg,
            reactions: msg.reactions?.filter(r => r.type !== reactionType)
          }
        } else {
          // Add new reaction
          const newReaction: MessageReaction = {
            type: reactionType,
            timestamp: new Date()
          }
          return {
            ...msg,
            reactions: [...(msg.reactions || []), newReaction]
          }
        }
      }
      return msg
    }))
  }

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const exportConversation = () => {
    const conversationData = {
      title: generateConversationTitle(messages),
      timestamp: new Date().toISOString(),
      messages: messages.map(m => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }))
    }

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${conversationData.title.replace(/[^a-zA-Z0-9]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:9000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        const assistantMessage: Message = {
          id: data.message.id,
          type: 'assistant',
          content: data.message.content,
          timestamp: new Date(data.message.timestamp)
        }

        setMessages(prev => [...prev, assistantMessage])
        setConversationId(data.conversation_id)
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or ask about payment analytics data.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          </div>
        )
      }

      if (line.trim() === '') {
        return <br key={index} />
      }

      return (
        <div key={index} className="mb-1">
          <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        </div>
      )
    })
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} flex`}>
      {/* History Sidebar */}
      {showHistory && (
        <div className={`w-80 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className={`p-1 hover:${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded`}
              >
                <X className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery ? 'No conversations found' : 'No saved conversations'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv)}
                    className={`w-full p-3 mb-2 text-left rounded-lg transition-colors ${conversationId === conv.id
                      ? theme === 'dark' ? 'bg-green-600/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
                      : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className={`font-medium text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {conv.title}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      {conv.timestamp.toLocaleDateString()} • {conv.messageCount} messages
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                      {conv.lastMessage}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 via-black to-gray-900' : 'bg-gradient-to-r from-gray-50 to-white'} border-b ${theme === 'dark' ? 'border-green-500/20' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`w-10 h-10 rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
                aria-label="Go back"
              >
                <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <Bot className="w-8 h-8 text-green-400" />
                  AI Chatbot
                </h1>
                <p className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  Intelligent assistant for payment analytics and insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Bot className="w-5 h-5" />
              <span className="font-medium">Smart Analytics</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className={`${theme === 'dark' ? 'bg-black/50' : 'bg-white/50'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} px-6 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${showHistory
                  ? theme === 'dark' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-green-50 text-green-600 border border-green-200'
                  : theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                aria-label="Chat history"
              >
                <History className="w-4 h-4" />
                <span className="text-sm font-medium">History</span>
                {conversations.length > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                    {conversations.length}
                  </span>
                )}
              </button>

              {/* New Conversation */}
              {messages.length > 0 && (
                <button
                  onClick={startNewConversation}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  aria-label="New conversation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Export Button */}
              {messages.length > 0 && (
                <button
                  onClick={exportConversation}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  aria-label="Export conversation"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>How can I help you today?</h2>
              <p className={`${theme === 'dark' ? 'text-white/60' : 'text-gray-600'} mb-6`}>Ask me about your payment data, cost savings, SLA compliance, or transaction analysis.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {[
                  "What are my total cost savings?",
                  "Show me SLA breaches",
                  "Analyze routing errors",
                  "Compare MDR rates by acquirer",
                  "Which transactions had the highest fees?",
                  "Show me routing compliance issues",
                  "What's my average settlement time?",
                  "Analyze cost savings by network"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className={`p-3 text-left border rounded-lg transition-colors ${theme === 'dark'
                      ? 'border-white/20 hover:border-green-500/50 hover:bg-white/5'
                      : 'border-gray-200 hover:border-green-500/50 hover:bg-green-50'
                      }`}
                  >
                    <span className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>{question}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-400" />
                    </div>
                  )}

                  <div className={`max-w-2xl ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div className={`p-4 rounded-lg ${message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                      {message.type === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="space-y-1">
                          {formatContent(message.content)}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    {message.type === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2">
                        {/* Copy Button */}
                        <button
                          onClick={() => copyMessage(message.content, message.id)}
                          className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                            }`}
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className={`w-3 h-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                          ) : (
                            <Copy className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                          )}
                        </button>

                        {/* Reaction Buttons */}
                        <button
                          onClick={() => addReaction(message.id, 'thumbs_up')}
                          className={`p-1 rounded transition-colors ${message.reactions?.some(r => r.type === 'thumbs_up')
                            ? theme === 'dark' ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
                            : theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => addReaction(message.id, 'thumbs_down')}
                          className={`p-1 rounded transition-colors ${message.reactions?.some(r => r.type === 'thumbs_down')
                            ? theme === 'dark' ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'
                            : theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                            }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>

                        {/* Timestamp */}
                        <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* User message timestamp */}
                    {message.type === 'user' && (
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    <Bot className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <Loader2 className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`border-t p-4 ${theme === 'dark' ? 'border-gray-700 bg-black' : 'border-gray-200 bg-white'
          }`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Ask about cost savings, SLA breaches, transactions..."
                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatbot