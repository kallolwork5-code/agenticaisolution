'use client'

import React from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatButtonProps {
  isOpen: boolean
  onClick: () => void
  hasUnreadMessages?: boolean
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  isOpen, 
  onClick, 
  hasUnreadMessages = false 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-gradient-to-r from-blue-600 to-purple-600
        text-white shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300
        ${isOpen ? 'bg-gray-600' : 'hover:scale-110'}
      `}
      whileHover={{ scale: isOpen ? 1 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <MessageCircle className="w-6 h-6" />
            {hasUnreadMessages && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default ChatButton