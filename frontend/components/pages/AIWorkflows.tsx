'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Play,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bot,
  Calendar,
  Clock,
  Users,
  Zap
} from 'lucide-react'
import WorkflowBuilder from './WorkflowBuilder'

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'draft' | 'paused'
  lastRun: string
  createdAt: string
  nodeCount: number
  creator: string
}

interface AIWorkflowsProps {
  onBack: () => void
}

const AIWorkflows: React.FC<AIWorkflowsProps> = ({ onBack }) => {
  const [view, setView] = useState<'list' | 'builder'>('list')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Dummy workflows data
  const workflows: Workflow[] = [
    {
      id: 'wf_1',
      name: 'Payment Processing Pipeline',
      description: 'Complete payment processing with data classification, SLA monitoring, routing optimization, and cost calculation',
      status: 'active',
      lastRun: '2024-01-19 14:30:00',
      createdAt: '2024-01-15 09:00:00',
      nodeCount: 4,
      creator: 'Admin User'
    },
    {
      id: 'wf_2', 
      name: 'Fraud Detection Workflow',
      description: 'Advanced fraud detection and risk assessment pipeline',
      status: 'active',
      lastRun: '2024-01-19 13:45:00',
      createdAt: '2024-01-10 11:30:00',
      nodeCount: 3,
      creator: 'Security Team'
    },
    {
      id: 'wf_3',
      name: 'Compliance Check Pipeline',
      description: 'Regulatory compliance verification and reporting',
      status: 'draft',
      lastRun: 'Never',
      createdAt: '2024-01-18 16:20:00',
      nodeCount: 2,
      creator: 'Compliance Officer'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'paused': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleViewWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId)
    setIsModalOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedWorkflow(null)
    setView('builder')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedWorkflow(null)
  }

  if (view === 'builder') {
    return (
      <WorkflowBuilder 
        onBack={() => setView('list')}
        workflowId={selectedWorkflow}
      />
    )
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
                <Zap className="w-8 h-8 text-green-400" />
                AI Workflows
              </h1>
              <p className="text-white/60">Manage and execute your intelligent workflow automations</p>
            </div>
          </div>
          
          <motion.button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Create New Workflow
          </motion.button>
        </motion.div>

        {/* Workflows Table */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-400" />
              Existing Workflows
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Nodes</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Last Run</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Creator</th>
                  <th className="text-left p-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow, index) => (
                  <motion.tr
                    key={workflow.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-white">{workflow.name}</div>
                        <div className="text-sm text-white/60 mt-1">{workflow.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Bot className="w-4 h-4" />
                        <span>{workflow.nodeCount} agents</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {workflow.lastRun === 'Never' ? 'Never' : new Date(workflow.lastRun).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{workflow.creator}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleViewWorkflow(workflow.id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Workflow"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => {
                            setSelectedWorkflow(workflow.id)
                            setView('builder')
                          }}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Workflow"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        
                        {workflow.status === 'active' && (
                          <motion.button
                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Execute Workflow"
                          >
                            <Play className="w-4 h-4" />
                          </motion.button>
                        )}
                        
                        <motion.button
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete Workflow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{workflows.filter(w => w.status === 'active').length}</div>
                <div className="text-sm text-white/60">Active Workflows</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{workflows.reduce((sum, w) => sum + w.nodeCount, 0)}</div>
                <div className="text-sm text-white/60">Total Agents</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{workflows.filter(w => w.lastRun !== 'Never').length}</div>
                <div className="text-sm text-white/60">Executed Today</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* View Workflow Modal */}
      <AnimatePresence>
        {isModalOpen && selectedWorkflow && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-6xl h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">
                  {workflows.find(w => w.id === selectedWorkflow)?.name}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="h-[calc(80vh-80px)]">
                <WorkflowBuilder 
                  onBack={handleCloseModal}
                  workflowId={selectedWorkflow}
                  isModal={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIWorkflows