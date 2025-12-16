'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, RotateCcw } from 'lucide-react'
import { ConnectionStatus as ConnectionStatusType } from '../../lib/types/visualization'

interface ConnectionStatusProps {
  status: ConnectionStatusType
  className?: string
}

export function ConnectionStatus({ status, className = '' }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (status.connected) return 'text-green-400'
    if (status.reconnecting) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusText = () => {
    if (status.connected) return 'Connected'
    if (status.reconnecting) return 'Reconnecting...'
    return 'Disconnected'
  }

  const getStatusIcon = () => {
    if (status.connected) return Wifi
    if (status.reconnecting) return RotateCcw
    return WifiOff
  }

  const StatusIcon = getStatusIcon()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        className={`${getStatusColor()}`}
        animate={status.reconnecting ? { rotate: 360 } : {}}
        transition={status.reconnecting ? { 
          duration: 2, 
          repeat: Infinity, 
          ease: "linear" 
        } : {}}
      >
        <StatusIcon className="w-4 h-4" />
      </motion.div>
      
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>

      {/* Connection Indicator Dot */}
      <motion.div
        className={`w-2 h-2 rounded-full ${
          status.connected 
            ? 'bg-green-400' 
            : status.reconnecting 
            ? 'bg-orange-400' 
            : 'bg-red-400'
        }`}
        animate={status.connected ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1]
        } : {}}
        transition={status.connected ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      />

      {/* Last Connected Time */}
      {status.lastConnected && !status.connected && (
        <span className="text-xs text-gray-500">
          Last: {status.lastConnected.toLocaleTimeString()}
        </span>
      )}

      {/* Error Message */}
      {status.error && (
        <span className="text-xs text-red-400" title={status.error}>
          ⚠️
        </span>
      )}
    </div>
  )
}