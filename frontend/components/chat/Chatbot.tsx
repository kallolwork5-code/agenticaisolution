'use client'

import React, { useState, useEffect } from 'react'
import ChatButton from './ChatButton'
import ChatWindow from './ChatWindow'

interface ChatbotProps {
  initialContext?: string
  className?: string
}

const Chatbot: React.FC<ChatbotProps> = ({ 
  initialContext,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)

  const handleToggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false)
    } else {
      setIsOpen(!isOpen)
    }
    
    if (hasUnreadMessages) {
      setHasUnreadMessages(false)
    }
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimizeChat = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  // Listen for sample question clicks from WelcomeMessage
  useEffect(() => {
    const handleQuestionClick = (event: CustomEvent) => {
      const question = event.detail.question
      // This would trigger sending the question automatically
      // For now, we'll just open the chat
      if (!isOpen) {
        setIsOpen(true)
      }
    }

    window.addEventListener('chatQuestionClick', handleQuestionClick as EventListener)
    
    return () => {
      window.removeEventListener('chatQuestionClick', handleQuestionClick as EventListener)
    }
  }, [isOpen])

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Chat Window */}
      <div className="pointer-events-auto">
        <ChatWindow
          isOpen={isOpen && !isMinimized}
          onClose={handleCloseChat}
          onMinimize={handleMinimizeChat}
        />
      </div>

      {/* Chat Button */}
      <div className="pointer-events-auto">
        <ChatButton
          isOpen={isOpen && !isMinimized}
          onClick={handleToggleChat}
          hasUnreadMessages={hasUnreadMessages}
        />
      </div>

      {/* Minimized Indicator */}
      {isMinimized && (
        <div className="pointer-events-auto fixed bottom-20 right-6 z-40">
          <button
            onClick={handleToggleChat}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">Payment AI</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Chatbot