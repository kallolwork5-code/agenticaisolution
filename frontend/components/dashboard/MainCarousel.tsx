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
  Zap,
  CreditCard,
  DollarSign,
  TrendingUp,
  PieChart,
  Activity
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
      id: 'ai-workflows',
      title: 'AI Workflows',
      description: 'Visual agent orchestration for automated analysis with real-time execution monitoring',
      icon: Zap,
      color: 'text-green-300',
      gradient: 'from-green-500 to-green-600',
      onClick: () => onNavigate('ai-workflows')
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
    <div className="min-h-screen bg-black relative overflow-hidden p-8">
      {/* Animated Financial Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Credit Cards */}
        <motion.div
          className="absolute top-20 left-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-16 h-10 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg border border-green-400/30 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-green-400/60" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-40 right-20"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <div className="w-16 h-10 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-lg border border-emerald-400/30 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-emerald-400/60" />
          </div>
        </motion.div>

        {/* Floating Money Icons */}
        <motion.div
          className="absolute top-60 left-1/4"
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full border border-green-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-500/70" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-40 right-1/3"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-500/70" />
          </div>
        </motion.div>

        {/* Floating Chart Icons */}
        <motion.div
          className="absolute top-32 right-1/4"
          animate={{
            y: [0, -18, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <div className="w-14 h-14 bg-teal-500/20 rounded-xl border border-teal-500/30 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-teal-500/70" />
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-60 left-1/3"
          animate={{
            y: [0, 22, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        >
          <div className="w-14 h-14 bg-green-600/20 rounded-xl border border-green-600/30 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-green-600/70" />
          </div>
        </motion.div>

        <motion.div
          className="absolute top-80 left-20"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        >
          <div className="w-14 h-14 bg-emerald-600/20 rounded-xl border border-emerald-600/30 flex items-center justify-center">
            <PieChart className="w-7 h-7 text-emerald-600/70" />
          </div>
        </motion.div>

        {/* Interconnecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated connecting lines */}
          <motion.path
            d="M 100 150 Q 300 200 500 180 T 800 160"
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          
          <motion.path
            d="M 200 300 Q 400 250 600 280 T 900 260"
            stroke="url(#connectionGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3,7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
          />
          
          <motion.path
            d="M 150 400 Q 350 350 550 380 T 850 360"
            stroke="url(#connectionGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8,4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
          />
        </svg>

        {/* Subtle Activity Indicators */}
        <motion.div
          className="absolute bottom-20 right-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-10 h-10 bg-green-400/20 rounded-full border border-green-400/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-400/80" />
          </div>
        </motion.div>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 via-transparent to-emerald-900/5 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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