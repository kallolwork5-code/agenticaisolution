'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { Building, ExternalLink } from 'lucide-react'

import { executiveDashboardData } from '../data'
import { PieChartData } from '@/lib/chart-types'

interface OnUsOffUsChartProps {
  height?: number
  animated?: boolean
}

const OnUsOffUsChart: React.FC<OnUsOffUsChartProps> = ({
  height = 300,
  animated = true
}) => {
  // Convert data to chart format
  const chartData: PieChartData[] = executiveDashboardData.onUsOffUs.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color || '#3B82F6'
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isOnUs = data.name.toLowerCase().includes('on-us')
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name} Transactions</p>
          <p className="text-orange-400">
            Share: <span className="font-semibold">{data.value}%</span>
          </p>
          <p className="text-white/60 text-xs mt-1">
            {isOnUs ? 'Same bank issuer & acquirer' : 'Different bank networks'}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label function for pie slices
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={animated ? 1000 : 0}
            startAngle={90}
            endAngle={450}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* On-us vs Off-us Breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item, index) => {
          const isOnUs = item.name.toLowerCase().includes('on-us')
          const Icon = isOnUs ? Building : ExternalLink
          const bgColor = isOnUs ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'
          const textColor = isOnUs ? 'text-blue-400' : 'text-green-400'
          const valueColor = isOnUs ? 'text-blue-300' : 'text-green-300'
          
          return (
            <div key={item.name} className={`${bgColor} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>{item.name}</span>
              </div>
              <div className={`text-2xl font-bold ${valueColor}`}>{item.value}%</div>
              <div className="text-white/60 text-xs">
                {isOnUs ? 'Internal processing' : 'External network'}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Processing Efficiency Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <div className="text-orange-400 text-sm font-medium">Processing Cost</div>
          <div className="text-orange-300 text-sm">On-us: Lower | Off-us: Higher</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-purple-400 text-sm font-medium">Settlement Speed</div>
          <div className="text-purple-300 text-sm">On-us: Faster | Off-us: Standard</div>
        </div>
      </div>
      
      {/* Business Impact */}
      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span className="text-orange-400 text-sm font-medium">Business Impact</span>
        </div>
        <p className="text-orange-300 text-sm">
          61% on-us transactions provide cost advantages and faster settlement times
        </p>
      </div>
    </motion.div>
  )
}

export default OnUsOffUsChart