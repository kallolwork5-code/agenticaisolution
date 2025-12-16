'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Brain, 
  Activity, 
  Settings, 
  Play,
  Pause,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface AIEngineProps {
  onBack: () => void
}

const AIEngine: React.FC<AIEngineProps> = ({ onBack }) => {
  const agents = [
    {
      id: 1,
      name: 'Transaction Classifier',
      description: 'Classifies incoming transactions by type and merchant category',
      status: 'Active',
      statusColor: 'text-green-400',
      performance: 98.5,
      throughput: '1,247/min',
      lastRun: '2 minutes ago'
    },
    {
      id: 2,
      name: 'MDR Calculator',
      description: 'Calculates merchant discount rates based on volume and risk',
      status: 'Active',
      statusColor: 'text-green-400',
      performance: 97.2,
      throughput: '892/min',
      lastRun: '1 minute ago'
    },
    {
      id: 3,
      name: 'SLA Monitor',
      description: 'Monitors transaction processing times against SLA requirements',
      status: 'Warning',
      statusColor: 'text-yellow-400',
      performance: 94.8,
      throughput: '654/min',
      lastRun: '5 minutes ago'
    },
    {
      id: 4,
      name: 'Routing Optimizer',
      description: 'Optimizes payment routing for best success rates and costs',
      status: 'Inactive',
      statusColor: 'text-gray-400',
      performance: 0,
      throughput: '0/min',
      lastRun: '2 hours ago'
    }
  ]

  const metrics = [
    { label: 'Active Agents', value: '3/4', icon: Brain, color: 'bg-green-500' },
    { label: 'Avg Performance', value: '96.8%', icon: BarChart3, color: 'bg-green-600' },
    { label: 'Total Throughput', value: '2.8K/min', icon: Zap, color: 'bg-white' },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'bg-green-400' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'Inactive':
        return <Pause className="w-5 h-5 text-gray-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
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
              <h1 className="text-4xl font-bold text-white mb-2">AI Engine</h1>
              <p className="text-white/60 text-lg">Monitor and configure AI agents for reconciliation processing</p>
            </div>
          </div>
          
          <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/25">
            <Settings className="w-5 h-5" />
            Configure Agents
          </button>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color === 'bg-white' ? 'text-black' : 'text-white'}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Status */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">System Status</h2>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">CPU Usage</span>
                <span className="text-white font-medium">45%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">Memory Usage</span>
                <span className="text-white font-medium">67%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-white h-3 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70">Queue Length</span>
                <span className="text-white font-medium">23</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-green-400 h-3 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                    <Brain className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{agent.name}</h3>
                    <p className="text-white/60 text-sm">{agent.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(agent.status)}
                  <span className={`${agent.statusColor} font-medium text-sm`}>{agent.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-white/60 text-xs mb-1">Performance</p>
                  <p className="text-white font-semibold text-lg">{agent.performance}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Throughput</p>
                  <p className="text-white font-semibold text-lg">{agent.throughput}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Last Run</p>
                  <p className="text-white font-semibold text-lg">{agent.lastRun}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300">
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                  <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-2 transition-all duration-300">
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                </div>
                
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-2 transition-all duration-300">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AIEngine