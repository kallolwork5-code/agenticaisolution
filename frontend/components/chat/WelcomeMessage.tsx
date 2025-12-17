'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bot, BarChart3, DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

const WelcomeMessage: React.FC = () => {
  const sampleQuestions = [
    {
      icon: <DollarSign className="w-4 h-4" />,
      text: "What are my total cost savings?",
      category: "Cost Analysis"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "Show me SLA breaches",
      category: "Compliance"
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      text: "Analyze routing errors",
      category: "Routing"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      text: "Compare MDR rates by acquirer",
      category: "Analytics"
    }
  ]

  const capabilities = [
    "Payment transaction analysis",
    "Cost savings calculations", 
    "SLA compliance monitoring",
    "Routing optimization insights",
    "MDR rate comparisons",
    "Error analysis & recommendations"
  ]

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">Welcome to Payment Analytics AI</h3>
        <p className="text-sm text-gray-600">I can help you analyze your payment data and provide insights.</p>
      </div>

      {/* Capabilities */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          What I can help with:
        </h4>
        <div className="grid grid-cols-1 gap-1">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              className="text-xs text-blue-700 flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-1 h-1 bg-blue-600 rounded-full" />
              {capability}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample Questions */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-3">Try asking:</h4>
        <div className="space-y-2">
          {sampleQuestions.map((question, index) => (
            <motion.button
              key={index}
              className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('chatQuestionClick', { 
                  detail: { question: question.text } 
                })
                window.dispatchEvent(event)
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-blue-600 group-hover:text-blue-700">
                  {question.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 group-hover:text-blue-800">
                    {question.text}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-blue-600">
                    {question.category}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Data Context Info */}
      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-400">
        <p className="text-xs text-gray-600">
          <strong>Data Context:</strong> I have access to your transaction records, rate cards, 
          routing rules, and compliance data to provide accurate insights.
        </p>
      </div>
    </motion.div>
  )
}

export default WelcomeMessage