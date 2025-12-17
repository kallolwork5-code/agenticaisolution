'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.type === 'user'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatContent = (content: string) => {
    // Split content by lines and format
    const lines = content.split('\n')
    return lines.map((line, index) => {
      // Handle bold text (**text**)
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          </div>
        )
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <br key={index} />
      }
      
      // Regular lines
      return (
        <div key={index} className="mb-1">
          <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        </div>
      )
    })
  }

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[280px] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`
            px-4 py-3 rounded-lg text-sm
            ${isUser 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
            }
          `}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="space-y-1">
              {formatContent(message.content)}
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}

export default ChatMessage