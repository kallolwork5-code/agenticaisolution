'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Bot,
  User,
  Paperclip,
  Mic,
  MoreVertical
} from 'lucide-react'

interface ChatbotProps {
  onBack: () => void
}

interface Message {
  id: number
  type: 'user' | 'bot'
  content: string
  timestamp: string
}

const Chatbot: React.FC<ChatbotProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your CollectiSense AI assistant. I can help you with transaction reconciliation, SLA monitoring, MDR calculations, and routing optimization. How can I assist you today?',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      type: 'user',
      content: 'Can you show me the current SLA compliance status?',
      timestamp: '10:31 AM'
    },
    {
      id: 3,
      type: 'bot',
      content: 'Based on the latest data, your SLA compliance is at 99.2%. Here\'s the breakdown:\n\n• Transaction Processing: 99.5% (Target: 99%)\n• Settlement Times: 98.8% (Target: 98%)\n• Error Resolution: 99.4% (Target: 99%)\n\nAll metrics are within acceptable ranges. Would you like me to show you any specific transactions that missed SLA targets?',
      timestamp: '10:31 AM'
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')

  const quickActions = [
    'Check SLA Status',
    'View MDR Rates',
    'Transaction Summary',
    'Routing Performance',
    'Error Analysis',
    'Generate Report'
  ]

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages([...messages, newMessage])
      setInputMessage('')
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          type: 'bot',
          content: 'I understand your query. Let me process that information for you...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, botResponse])
      }, 1000)
    }
  }

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AI Chatbot</h1>
              <p className="text-white/60 text-lg">Interactive assistant for reconciliation queries and support</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Online</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Actions Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left px-4 py-3 bg-white/10 hover:bg-green-500/20 hover:border-green-500/50 border border-white/20 rounded-xl text-white/80 hover:text-white transition-all duration-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/60 mb-4">Recent Topics</h4>
                <div className="space-y-3">
                  <div className="text-sm text-white/50">• SLA Compliance</div>
                  <div className="text-sm text-white/50">• MDR Calculations</div>
                  <div className="text-sm text-white/50">• Transaction Errors</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">CollectiSense AI</h3>
                    <p className="text-white/60 text-sm">Reconciliation Assistant</p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300">
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' ? 'bg-green-500' : 'bg-white'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5 text-black" />
                        ) : (
                          <Bot className="w-5 h-5 text-black" />
                        )}
                      </div>
                      <div className={`rounded-2xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-green-500 text-black' 
                          : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                      }`}>
                        <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-3 ${
                          message.type === 'user' ? 'text-black/70' : 'text-white/60'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300">
                    <Paperclip className="w-5 h-5 text-white" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    />
                  </div>
                  
                  <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300">
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    className="w-12 h-12 rounded-xl bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <Send className="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot