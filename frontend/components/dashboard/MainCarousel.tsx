'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Database, 
  Brain, 
  MessageCircle,
  BarChart3,
  ArrowRight,
  Zap
} from 'lucide-react'

interface CarouselItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  onClick: () => void
}

interface MainCarouselProps {
  onNavigate: (page: string) => void
}

const MainCarousel: React.FC<MainCarouselProps> = ({ onNavigate }) => {
  const carouselItems: CarouselItem[] = [
    {
      id: 'prompts',
      title: 'Prompt Repository',
      description: 'Manage and organize AI prompts for transaction processing and reconciliation workflows',
      icon: FileText,
      color: 'text-green-400',
      gradient: 'from-green-500 to-green-600',
      onClick: () => onNavigate('prompts')
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Upload, process, and manage transaction data, rate cards, and routing information',
      icon: Database,
      color: 'text-green-300',
      gradient: 'from-green-400 to-green-500',
      onClick: () => onNavigate('data')
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View comprehensive analytics, charts, and insights from transaction data and reconciliation metrics',
      icon: BarChart3,
      color: 'text-white',
      gradient: 'from-green-600 to-green-700',
      onClick: () => onNavigate('dashboard')
    },
    {
      id: 'ai-engine',
      title: 'AI Engine',
      description: 'Monitor and configure AI agents for SLA processing, MDR calculations, and routing logic',
      icon: Brain,
      color: 'text-green-300',
      gradient: 'from-green-500 to-green-600',
      onClick: () => onNavigate('ai-engine')
    },
    {
      id: 'chatbot',
      title: 'Chatbot',
      description: 'Interactive AI assistant for reconciliation queries and system support',
      icon: MessageCircle,
      color: 'text-green-200',
      gradient: 'from-green-300 to-green-400',
      onClick: () => onNavigate('chatbot')
    }
  ]

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            CollectiSense AI 
          </h1>
          <p className="text-xl text-white/70 mb-2">
            An AI Powered Digital collection  Platform
          </p>
          <p className="text-white/50">
            Choose a module to get started with your reconciliation workflow
          </p>
        </motion.div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {carouselItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
            >
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-80 overflow-hidden border border-white/10 hover:border-green-500/50 transition-all duration-300">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="absolute bottom-6 right-6">
                  <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-green-500 flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-black transition-colors" />
                  </div>
                </div>

                {/* Animated Elements */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Zap className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  )
}

export default MainCarousel