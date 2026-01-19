'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2,
  Tag,
  Clock,
  Save,
  X
} from 'lucide-react'

interface PromptRepositoryProps {
  onBack: () => void
}

interface Prompt {
  id: number
  agent_role: string
  prompt_type: string
  prompt_text: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PromptCreate {
  agent_role: string
  prompt_type: string
  prompt_text: string
}

const PromptRepository: React.FC<PromptRepositoryProps> = ({ onBack }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [agentRoles, setAgentRoles] = useState<string[]>([])
  const [promptTypes, setPromptTypes] = useState<string[]>([])

  // Predefined agent roles for CollectiSense - Document Summarizer first
  const predefinedAgents = [
    'document_summarizer',
    'data_classification',
    'sla_agent', 
    'transaction_reconciliation',
    'routing_agent'
  ]

  // Predefined prompt types
  const predefinedTypes = [
    'system',
    'task', 
    'safety',
    'output'
  ]

  const [newPrompt, setNewPrompt] = useState<PromptCreate>({
    agent_role: '',
    prompt_type: 'system',
    prompt_text: ''
  })

  // Fetch prompts from API
  const fetchPrompts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/prompts')
      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
        setFilteredPrompts(data)
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch agent roles and prompt types
  const fetchMetadata = async () => {
    try {
      const [rolesResponse, typesResponse] = await Promise.all([
        fetch('http://localhost:8000/api/prompts/agents/roles'),
        fetch('http://localhost:8000/api/prompts/types/all')
      ])
      
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json()
        const uniqueRoles = Array.from(new Set([...predefinedAgents, ...roles]))
        setAgentRoles(uniqueRoles)
      }
      
      if (typesResponse.ok) {
        const types = await typesResponse.json()
        const uniqueTypes = Array.from(new Set([...predefinedTypes, ...types]))
        setPromptTypes(uniqueTypes)
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }

  useEffect(() => {
    fetchPrompts()
    fetchMetadata()
  }, [])

  // Filter prompts based on search and filters
  useEffect(() => {
    let filtered = prompts

    if (searchTerm) {
      filtered = filtered.filter(prompt => 
        prompt.agent_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedAgent) {
      filtered = filtered.filter(prompt => prompt.agent_role === selectedAgent)
    }

    if (selectedType) {
      filtered = filtered.filter(prompt => prompt.prompt_type === selectedType)
    }

    setFilteredPrompts(filtered)
  }, [prompts, searchTerm, selectedAgent, selectedType])

  // Create new prompt
  const handleCreatePrompt = async () => {
    // Validation
    if (!newPrompt.agent_role.trim()) {
      alert('Please enter an agent role')
      return
    }
    if (!newPrompt.prompt_type.trim()) {
      alert('Please enter a prompt type')
      return
    }
    if (!newPrompt.prompt_text.trim()) {
      alert('Please enter prompt text')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPrompt,
          agent_role: newPrompt.agent_role.trim(),
          prompt_type: newPrompt.prompt_type.trim(),
          prompt_text: newPrompt.prompt_text.trim()
        })
      })

      if (response.ok) {
        await fetchPrompts()
        setShowCreateModal(false)
        setNewPrompt({ agent_role: '', prompt_type: 'system', prompt_text: '' })
      } else {
        const error = await response.json()
        alert(`Error creating prompt: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      alert('Error creating prompt. Please try again.')
    }
  }

  // Update prompt
  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return

    // Validation
    if (!editingPrompt.agent_role.trim()) {
      alert('Please enter an agent role')
      return
    }
    if (!editingPrompt.prompt_type.trim()) {
      alert('Please enter a prompt type')
      return
    }
    if (!editingPrompt.prompt_text.trim()) {
      alert('Please enter prompt text')
      return
    }

    try {
      const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_role: editingPrompt.agent_role.trim(),
          prompt_type: editingPrompt.prompt_type.trim(),
          prompt_text: editingPrompt.prompt_text.trim()
        })
      })

      if (response.ok) {
        await fetchPrompts()
        setEditingPrompt(null)
      } else {
        const error = await response.json()
        alert(`Error updating prompt: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      alert('Error updating prompt. Please try again.')
    }
  }

  // Delete prompt
  const handleDeletePrompt = async (promptId: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPrompts()
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  const getAgentDisplayName = (agentRole: string) => {
    const names: Record<string, string> = {
      'document_summarizer': 'Document Summarizer',
      'data_classification': 'Data Classification',
      'sla_agent': 'SLA Agent',
      'transaction_reconciliation': 'Transaction Reconciliation',
      'routing_agent': 'Routing Agent'
    }
    // If it's a predefined agent, return the display name, otherwise format the agent role
    return names[agentRole] || agentRole.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'system': 'text-green-400',
      'task': 'text-green-300',
      'safety': 'text-white',
      'output': 'text-green-200'
    }
    return colors[type] || 'text-blue-400' // Custom types get blue color
  }

  const getTypeBadgeStyle = (type: string) => {
    const styles: Record<string, string> = {
      'system': 'bg-green-500/20 text-green-400 border-green-500/30',
      'task': 'bg-green-400/20 text-green-300 border-green-400/30',
      'safety': 'bg-white/20 text-white border-white/30',
      'output': 'bg-green-300/20 text-green-200 border-green-300/30'
    }
    return styles[type] || 'bg-blue-500/20 text-blue-400 border-blue-500/30' // Custom types get blue style
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading prompts...</div>
      </div>
    )
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
              <h1 className="text-4xl font-bold text-white mb-2">Prompt Repository</h1>
              <p className="text-white/60 text-lg">Manage AI prompts for reconciliation workflows</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
          >
            <Plus className="w-5 h-5" />
            New Prompt
          </button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              />
            </div>
            <select 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            >
              <option value="" className="bg-black text-white">All Agents</option>
              {agentRoles.map(role => (
                <option key={role} value={role} className="bg-black text-white">{getAgentDisplayName(role)}</option>
              ))}
            </select>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
            >
              <option value="" className="bg-black text-white">All Types</option>
              {promptTypes.map(type => (
                <option key={type} value={type} className="bg-black text-white">{type}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Agent Carousel */}
        <div className="space-y-8">
          {/* Get all unique agent roles from filtered prompts */}
          {Array.from(new Set(filteredPrompts.map(p => p.agent_role)))
            .sort((a, b) => {
              // Sort predefined agents first, then custom agents alphabetically
              const aPredefined = predefinedAgents.includes(a)
              const bPredefined = predefinedAgents.includes(b)
              if (aPredefined && !bPredefined) return -1
              if (!aPredefined && bPredefined) return 1
              return a.localeCompare(b)
            })
            .map((agentRole, agentIndex) => {
            const agentPrompts = filteredPrompts.filter(prompt => prompt.agent_role === agentRole)
            
            if (agentPrompts.length === 0) return null

            return (
              <motion.div
                key={agentRole}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: agentIndex * 0.1 }}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      predefinedAgents.includes(agentRole) 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}>
                      <FileText className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {getAgentDisplayName(agentRole)}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {agentPrompts.length} prompt{agentPrompts.length !== 1 ? 's' : ''} available
                        {!predefinedAgents.includes(agentRole) && (
                          <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            Custom
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompts Carousel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {agentPrompts
                    .sort((a, b) => {
                      const typeOrder = ['system', 'task', 'safety', 'output']
                      const aIndex = typeOrder.indexOf(a.prompt_type)
                      const bIndex = typeOrder.indexOf(b.prompt_type)
                      // If type is not in predefined list, put it at the end
                      if (aIndex === -1 && bIndex === -1) return a.prompt_type.localeCompare(b.prompt_type)
                      if (aIndex === -1) return 1
                      if (bIndex === -1) return -1
                      return aIndex - bIndex
                    })
                    .map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-500/50 hover:bg-white/15 transition-all duration-300 group"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full border ${getTypeBadgeStyle(prompt.prompt_type)}`}>
                          <div className="flex items-center gap-2">
                            <Tag className={`w-3 h-3 ${getTypeColor(prompt.prompt_type)}`} />
                            <span className={`${getTypeColor(prompt.prompt_type)} text-xs font-medium uppercase tracking-wide`}>
                              {prompt.prompt_type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => setEditingPrompt(prompt)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-green-500 hover:text-black flex items-center justify-center transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-white/80 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {prompt.prompt_text.substring(0, 120)}...
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(prompt.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-green-400 font-medium">v{prompt.version}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPrompt) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              className="bg-black/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingPrompt(null)
                  }}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Agent Role
                  </label>
                  <input
                    type="text"
                    value={editingPrompt ? editingPrompt.agent_role : newPrompt.agent_role}
                    onChange={(e) => {
                      if (editingPrompt) {
                        setEditingPrompt({ ...editingPrompt, agent_role: e.target.value })
                      } else {
                        setNewPrompt({ ...newPrompt, agent_role: e.target.value })
                      }
                    }}
                    placeholder="Enter agent role (e.g., data_classification, custom_agent)"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                  <p className="text-white/40 text-xs mt-2">
                    Common agents: document_summarizer, data_classification, sla_agent, transaction_reconciliation, routing_agent
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Prompt Type
                  </label>
                  <input
                    type="text"
                    value={editingPrompt ? editingPrompt.prompt_type : newPrompt.prompt_type}
                    onChange={(e) => {
                      if (editingPrompt) {
                        setEditingPrompt({ ...editingPrompt, prompt_type: e.target.value })
                      } else {
                        setNewPrompt({ ...newPrompt, prompt_type: e.target.value })
                      }
                    }}
                    placeholder="Enter prompt type (e.g., system, task, safety, output)"
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <p className="text-white/40 text-xs mr-2">Quick select:</p>
                    {predefinedTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingPrompt) {
                            setEditingPrompt({ ...editingPrompt, prompt_type: type })
                          } else {
                            setNewPrompt({ ...newPrompt, prompt_type: type })
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          (editingPrompt ? editingPrompt.prompt_type : newPrompt.prompt_type) === type
                            ? 'bg-green-500 text-black'
                            : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Prompt Text
                  </label>
                  <textarea
                    value={editingPrompt ? editingPrompt.prompt_text : newPrompt.prompt_text}
                    onChange={(e) => {
                      if (editingPrompt) {
                        setEditingPrompt({ ...editingPrompt, prompt_text: e.target.value })
                      } else {
                        setNewPrompt({ ...newPrompt, prompt_text: e.target.value })
                      }
                    }}
                    rows={12}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none"
                    placeholder="Enter your prompt text here..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingPrompt(null)
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  <Save className="w-4 h-4" />
                  {editingPrompt ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptRepository