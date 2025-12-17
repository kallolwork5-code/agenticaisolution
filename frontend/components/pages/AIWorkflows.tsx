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
  Zap,
  DollarSign,
  Shield
} from 'lucide-react'

// Types for AI Workflows
interface Agent {
  id: string
  name: string
  description: string
  category: string
  inputs: string[]
  outputs: string[]
  estimated_duration: string
  icon: string
  status: 'idle' | 'running' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
  results?: any
  error?: string
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  agents: string[]
  estimated_duration: string
  frequency: string
}

interface WorkflowExecution {
  workflow_id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  execution_date: string
  created_at: string
  started_at?: string
  completed_at?: string
  overall_progress: number
  steps: AgentStep[]
  results_summary?: any
}

interface AgentStep {
  agent_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  start_time?: string
  end_time?: string
  progress: number
  result?: any
  error?: string
}

interface WebSocketMessage {
  type: string
  workflow_id: string
  agent_name?: string
  status?: string
  progress?: number
  message?: string
  result?: any
  error?: string
}

interface AIWorkflowsProps {
  onBack: () => void
}

const AIWorkflows: React.FC<AIWorkflowsProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTemplate, setSelectedTemplate] = useState<string>('daily_operations')
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([])

  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([])
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)

  // Load available agents and templates
  useEffect(() => {
    loadAvailableAgents()
    loadWorkflowTemplates()
    loadExecutionHistory()
  }, [])

  const loadAvailableAgents = async () => {
    try {
      const response = await fetch('/api/ai-workflows/available-agents')
      const data = await response.json()
      if (data.status === 'success') {
        const agentsWithStatus = data.agents.map((agent: any) => ({
          ...agent,
          status: 'idle',
          progress: 0
        }))
        setAvailableAgents(agentsWithStatus)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  const loadWorkflowTemplates = async () => {
    try {
      const response = await fetch('/api/ai-workflows/workflow-templates')
      const data = await response.json()
      if (data.status === 'success') {
        setWorkflowTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const loadExecutionHistory = async () => {
    try {
      const response = await fetch('/api/ai-workflows/executions')
      const data = await response.json()
      if (data.status === 'success') {
        setExecutionHistory(data.executions)
      }
    } catch (error) {
      console.error('Failed to load execution history:', error)
    }
  }

  // WebSocket connection for real-time updates
  const connectWebSocket = (workflowId: string) => {
    const ws = new WebSocket(`ws://localhost:8000/api/ai-workflows/ws/${workflowId}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected for workflow:', workflowId)
      setWebsocket(ws)
    }
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWebsocket(null)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'workflow_started':
        addOrchestratorLog(`🚀 Workflow started with ${message.message}`)
        break
      
      case 'agent_started':
        addOrchestratorLog(`🤖 Starting ${message.agent_name}`)
        updateAgentStatus(message.agent_name!, 'running', 0)
        break
      
      case 'agent_progress':
        updateAgentStatus(message.agent_name!, 'running', message.progress!)
        addOrchestratorLog(`⚡ ${message.agent_name}: ${message.message}`)
        break
      
      case 'agent_completed':
        updateAgentStatus(message.agent_name!, 'completed', 100, message.result)
        addOrchestratorLog(`✅ ${message.agent_name} completed successfully`)
        break
      
      case 'agent_error':
        updateAgentStatus(message.agent_name!, 'error', 0, null, message.error)
        addOrchestratorLog(`❌ ${message.agent_name} failed: ${message.error}`)
        break
      
      case 'workflow_completed':
        addOrchestratorLog('🎉 Workflow completed successfully!')
        setIsExecuting(false)
        break
      
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }

  const addOrchestratorLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setOrchestratorLogs(prev => [...prev, `${timestamp} - ${message}`])
  }

  const updateAgentStatus = (agentName: string, status: string, progress: number, result?: any, error?: string) => {
    setAvailableAgents(prev => prev.map(agent => 
      agent.name.toLowerCase().includes(agentName.toLowerCase()) 
        ? { ...agent, status: status as any, progress, results: result, error }
        : agent
    ))
  }

  const startWorkflow = async () => {
    if (!selectedTemplate) return

    const template = workflowTemplates.find(t => t.id === selectedTemplate)
    if (!template) return

    try {
      setIsExecuting(true)
      setOrchestratorLogs([])
      
      const response = await fetch('/api/ai-workflows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          execution_date: selectedDate.toISOString().split('T')[0],
          workflow_template: selectedTemplate,
          agents: template.agents,
          parameters: { ui_execution: true }
        })
      })

      const data = await response.json()
      
      if (data.status === 'success') {
        addOrchestratorLog(`🚀 Workflow ${data.workflow_id} started`)
        connectWebSocket(data.workflow_id)
      } else {
        addOrchestratorLog(`❌ Failed to start workflow: ${data.detail}`)
        setIsExecuting(false)
      }
    } catch (error) {
      console.error('Failed to start workflow:', error)
      addOrchestratorLog(`💥 Error starting workflow: ${error}`)
      setIsExecuting(false)
    }
  }

  const stopWorkflow = () => {
    setIsExecuting(false)
    if (websocket) {
      websocket.close()
    }
    addOrchestratorLog('⏹️ Workflow stopped by user')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-green-400" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAgentIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <BarChart3 className="h-4 w-4" />
      case 'Routing': return <Workflow className="h-4 w-4" />
      case 'Settlement': return <DollarSign className="h-4 w-4" />
      case 'Financial': return <DollarSign className="h-4 w-4" />
      case 'Security': return <Shield className="h-4 w-4" />
      case 'Compliance': return <CheckCircle className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 p-8">
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

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAgentIcon(agent.category)}
                          <span className="font-medium text-white text-sm">{agent.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(agent.status)}
                          <span className="text-xs text-white/60 capitalize">{agent.status}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/60 mb-3">{agent.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${agent.progress}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/60">{agent.progress}% complete</div>
                      
                      {agent.results && (
                        <motion.div
                          className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="font-medium text-green-400 text-xs">✅ Completed</div>
                          <div className="text-green-300 text-xs">Results available for dashboard</div>
                        </motion.div>
                      )}
                      
                      {agent.error && (
                        <motion.div
                          className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="font-medium text-red-400 text-xs">❌ Error</div>
                          <div className="text-red-300 text-xs">{agent.error}</div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Orchestrator & Templates */}
            <div className="space-y-6">
              {/* Orchestrator Logs */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Bot className="w-6 h-6 text-purple-400" />
                  Orchestrator Agent
                </h2>
                
                <div className="h-[300px] overflow-y-auto bg-black/20 border border-white/10 rounded-lg p-3">
                  {orchestratorLogs.length === 0 ? (
                    <div className="text-center text-white/40 text-sm py-8">
                      Orchestrator logs will appear here during execution
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {orchestratorLogs.map((log, index) => (
                        <motion.div
                          key={index}
                          className="text-xs font-mono text-green-300"
                          initial={{ opacity: 0, x: -10 }}
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

              {/* Workflow Templates */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">Available Workflows</h2>
                
                <div className="space-y-3">
                  {workflowTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedTemplate === template.id 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-white text-sm">{template.name}</div>
                      <div className="text-xs text-white/60 mt-1">{template.description}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-white/60">{template.agents.length} agents</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-white/60">{template.estimated_duration}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Recent Executions</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/80 font-medium">Workflow</th>
                      <th className="text-left p-3 text-white/80 font-medium">Date</th>
                      <th className="text-left p-3 text-white/80 font-medium">Status</th>
                      <th className="text-left p-3 text-white/80 font-medium">Duration</th>
                      <th className="text-left p-3 text-white/80 font-medium">Agents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionHistory.slice(0, 10).map((execution, index) => (
                      <motion.tr
                        key={execution.workflow_id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <td className="p-3 text-white">{execution.name}</td>
                        <td className="p-3 text-white/60">{execution.execution_date}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <span className="text-white/80 capitalize">{execution.status}</span>
                          </div>
                        </td>
                        <td className="p-3 text-white/60">
                          {execution.started_at && execution.completed_at 
                            ? `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s`
                            : '-'
                          }
                        </td>
                        <td className="p-3 text-white/60">{execution.steps?.length || 0}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIWorkflows