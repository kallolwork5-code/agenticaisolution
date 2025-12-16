'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  Database, 
  FileSpreadsheet, 
  Download,
  Eye,
  Trash2,
  Filter,
  RefreshCw
} from 'lucide-react'

interface DataManagementProps {
  onBack: () => void
}

const DataManagement: React.FC<DataManagementProps> = ({ onBack }) => {
  const dataFiles = [
    {
      id: 1,
      name: 'Transaction_Data_Dec2024.csv',
      type: 'Transaction Data',
      size: '2.4 MB',
      records: 15420,
      uploadDate: '2024-12-16',
      status: 'Processed',
      statusColor: 'text-green-400'
    },
    {
      id: 2,
      name: 'MDR_Rate_Card_Q4.xlsx',
      type: 'Rate Card',
      size: '856 KB',
      records: 2340,
      uploadDate: '2024-12-15',
      status: 'Processing',
      statusColor: 'text-yellow-400'
    },
    {
      id: 3,
      name: 'Routing_Logic_Rules.json',
      type: 'Routing Rules',
      size: '124 KB',
      records: 89,
      uploadDate: '2024-12-14',
      status: 'Processed',
      statusColor: 'text-green-400'
    },
    {
      id: 4,
      name: 'SLA_Requirements_2024.csv',
      type: 'SLA Data',
      size: '445 KB',
      records: 567,
      uploadDate: '2024-12-13',
      status: 'Failed',
      statusColor: 'text-red-400'
    }
  ]

  const stats = [
    { label: 'Total Files', value: '247', icon: Database, color: 'bg-green-500' },
    { label: 'Total Records', value: '1.2M', icon: FileSpreadsheet, color: 'bg-green-600' },
    { label: 'Processing Queue', value: '12', icon: RefreshCw, color: 'bg-white' },
    { label: 'Storage Used', value: '45.2 GB', icon: Database, color: 'bg-green-400' }
  ]

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
              <h1 className="text-4xl font-bold text-white mb-2">Data Management</h1>
              <p className="text-white/60 text-lg">Upload and manage transaction data, rate cards, and routing rules</p>
            </div>
          </div>
          
          <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/25">
            <Upload className="w-5 h-5" />
            Upload Data
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color === 'bg-white' ? 'text-black' : 'text-white'}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <select className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300">
              <option className="bg-black text-white">All File Types</option>
              <option className="bg-black text-white">Transaction Data</option>
              <option className="bg-black text-white">Rate Card</option>
              <option className="bg-black text-white">Routing Rules</option>
              <option className="bg-black text-white">SLA Data</option>
            </select>
            <select className="px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300">
              <option className="bg-black text-white">All Status</option>
              <option className="bg-black text-white">Processed</option>
              <option className="bg-black text-white">Processing</option>
              <option className="bg-black text-white">Failed</option>
            </select>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white flex items-center gap-3 transition-all duration-300">
              <Filter className="w-5 h-5" />
              Apply Filters
            </button>
          </div>
        </motion.div>

        {/* Data Files Table */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">File Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Records</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Upload Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {dataFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                        <span className="text-white font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{file.type}</td>
                    <td className="px-6 py-4 text-white/70">{file.size}</td>
                    <td className="px-6 py-4 text-white/70">{file.records.toLocaleString()}</td>
                    <td className="px-6 py-4 text-white/70">{file.uploadDate}</td>
                    <td className="px-6 py-4">
                      <span className={`${file.statusColor} font-medium`}>{file.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-green-500 hover:text-black flex items-center justify-center transition-all duration-300">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-green-500 hover:text-black flex items-center justify-center transition-all duration-300">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-all duration-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DataManagement