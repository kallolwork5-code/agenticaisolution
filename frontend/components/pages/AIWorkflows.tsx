'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Square, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Bot,
  BarChart3,
  Workflow,
  ArrowLeft,
  Zap
} from 'lucide-react'

// Simple types for AI Workflows
interface Agent {
  id: string
  name: string
  description: string
  category: string
  status: 'idle' | 'running' | 'completed' | 'error'
  progress: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  agents: string[]
  estimated_duration: string
}

interface AIWorkflowsProps {
  onBack: () => void
}

const AIWorkflows: React.FC<AIWorkflowsProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTemplate, setSelectedTemplate] = useState<string>('comprehensive_payment_analysis')
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

  // Initialize dummy data
  useEffect(() => {
    const dummyAgents: Agent[] = [
      {
        id: 'sla_compliance',
        name: 'SLA Compliance Agent',
        description: 'Monitors SLA compliance and identifies breaches in payment processing',
        category: 'Compliance',
        status: 'idle',
        progress: 0
      },
      {
        id: 'routing_optimization',
        name: 'Routing Optimization Agent',
        description: 'Optimizes payment routing for better success rates and lower costs',
        category: 'Routing',
        status: 'idle',
        progress: 0
      },
      {
        id: 'rate_reconciliation',
        name: 'Rate Reconciliation Agent',
        description: 'Reconciles MDR rates and identifies discrepancies in billing',
        category: 'Financial',
        status: 'idle',
        progress: 0
      }
    ]

    const dummyTemplates: WorkflowTemplate[] = [
      {
        id: 'comprehensive_payment_analysis',
        name: 'Comprehensive Payment Analysis',
        description: 'Complete analysis of payment operations and performance',
        agents: ['sla_compliance', 'routing_optimization', 'rate_reconciliation'],
        estimated_duration: '6-10 minutes'
      },
      {
        id: 'compliance_monitoring',
        name: 'Compliance Monitoring',
        description: 'Monitor regulatory compliance and policy adherence',
        agents: ['sla_compliance'],
        estimated_duration: '3-5 minutes'
      },
      {
        id: 'routing_optimization',
        name: 'Routing Optimization',
        description: 'Optimize payment routing for cost and success rates',
        agents: ['routing_optimization'],
        estimated_duration: '3-5 minutes'
      }
    ]

    setAvailableAgents(dummyAgents)
    setWorkflowTemplates(dummyTemplates)
  }, [])

  const addOrchestratorLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setOrchestratorLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const updateAgentStatus = (agentId: string, status: Agent['status'], progress: number) => {
    setAvailableAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status, progress } : agent
    ))
  }

  const startWorkflow = async () => {
    if (isExecuting) return
    
    setIsExecuting(true)
    setOrchestratorLogs([])
    setConnectionStatus('connecting')
    
    // Reset all agents
    setAvailableAgents(prev => prev.map(agent => ({
      ...agent,
      status: 'idle' as const,
      progress: 0
    })))

    addOrchestratorLog('🚀 Starting workflow execution...')
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected')
      addOrchestratorLog('🔗 Real-time connection established')
      
      // Start agent execution simulation
      const template = workflowTemplates.find(t => t.id === selectedTemplate)
      if (template) {
        addOrchestratorLog(`📋 Using template: ${template.name}`)
        simulateAgentExecution(template.agents)
      }
    }, 1500)
  }

  const simulateAgentExecution = (agentIds: string[]) => {
    agentIds.forEach((agentId, index) => {
      const agent = availableAgents.find(a => a.id === agentId)
      if (!agent) return

      const startDelay = index * 3000 // Stagger starts by 3 seconds
      
      setTimeout(() => {
        addOrchestratorLog(`🎯 Starting ${agent.name}...`)
        updateAgentStatus(agentId, 'running', 10)
        
        // Simulate progress updates
        const progressSteps = [25, 50, 75, 90, 100]
        progressSteps.forEach((progress, progressIndex) => {
          setTimeout(() => {
            updateAgentStatus(agentId, 'running', progress)
            
            if (progress === 100) {
              updateAgentStatus(agentId, 'completed', 100)
              addOrchestratorLog(`✅ ${agent.name} completed successfully`)
              
              // Check if all agents are done
              if (index === agentIds.length - 1) {
                setTimeout(() => {
                  addOrchestratorLog('🎉 All agents completed successfully!')
                  addOrchestratorLog('✨ Workflow orchestration completed!')
                  setIsExecuting(false)
                  setConnectionStatus('disconnected')
                }, 1000)
              }
            }
          }, (progressIndex + 1) * 1000)
        })
      }, startDelay)
    })
  }

  const stopWorkflow = () => {
    setIsExecuting(false)
    setConnectionStatus('disconnected')
    addOrchestratorLog('⏹️ Workflow stopped by user')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Workflow className="w-8 h-8 text-green-400" />
                AI Workflows
              </h1>
              <p className="text-white/60">Visual agent orchestration for automated analysis and insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Intelligent Orchestration</span>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Date Selector */}
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-green-400" />
                <div>
                  <label className="block text-xs text-white/60 mb-1">Execution Date</label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50"
                  />
                </div>
              </div>

              {/* Workflow Selector */}
              <div className="flex items-center gap-3">
                <Workflow className="w-5 h-5 text-green-400" />
                <div>
                  <label className="block text-xs text-white/60 mb-1">Workflow Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white min-w-[200px] focus:outline-none focus:border-green-500/50"
                  >
                    {workflowTemplates.map((template) => (
                      <option key={template.id} value={template.id} className="bg-gray-800">
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Connection Status & Control Buttons */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  connectionStatus === 'error' ? 'bg-red-400 animate-pulse' :
                  'bg-gray-400'
                }`} />
                <span className={`text-xs font-medium ${
                  connectionStatus === 'connected' ? 'text-green-400' :
                  connectionStatus === 'connecting' ? 'text-yellow-400' :
                  connectionStatus === 'error' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {connectionStatus === 'connected' ? 'Live' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   connectionStatus === 'error' ? 'Connection Issue' :
                   'Offline'}
                </span>
              </div>

              {/* Control Button */}
              {!isExecuting ? (
                <motion.button
                  onClick={startWorkflow}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-4 h-4" />
                  Run Workflow
                </motion.button>
              ) : (
                <motion.button
                  onClick={stopWorkflow}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="w-4 h-4" />
                  Stop Workflow
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Status Panel */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Bot className="w-6 h-6 text-green-400" />
                Agent Execution Status
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {availableAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    className="border border-white/10 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Bot className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                          <p className="text-xs text-white/60">{agent.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {agent.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-green-400" />}
                        {agent.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-xs text-white/80 capitalize font-medium">
                          {agent.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 mb-4">{agent.description}</p>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/80 font-medium">Progress</span>
                        <span className="text-white/60">{agent.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            agent.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            agent.status === 'running' ? 'bg-gradient-to-r from-blue-400 to-green-500' :
                            agent.status === 'error' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                            'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${agent.progress}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Orchestrator Logs */}
          <div className="space-y-6">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                Orchestrator Logs
              </h2>
              
              <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto">
                {orchestratorLogs.length === 0 ? (
                  <div className="text-center text-white/40 text-sm py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No logs yet. Start a workflow to see real-time updates.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orchestratorLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        className="text-sm text-green-300 font-mono"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIWorkflows