'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

import { executiveDashboardData } from '../data'
import { PieChartData } from '@/lib/chart-types'

interface NetworkSplitChartProps {
  height?: number
  animated?: boolean
  showLegend?: boolean
}

const NetworkSplitChart: React.FC<NetworkSplitChartProps> = ({
  height = 300,
  animated = true,
  showLegend = true
}) => {
  // Convert data to chart format
  const chartData: PieChartData[] = executiveDashboardData.networkSplit.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color || '#3B82F6'
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-green-400">
            Share: <span className="font-semibold">{data.value}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/70 text-sm">{entry.value} ({chartData[index]?.value}%)</span>
          </div>
        ))}
      </div>
    )
  }

  // Custom label function for pie slices
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
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
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Network Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-sm font-medium">Dominant Network</div>
          <div className="text-blue-300 text-lg font-bold">VISA (48%)</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-green-400 text-sm font-medium">Total Networks</div>
          <div className="text-green-300 text-lg font-bold">{chartData.length}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default NetworkSplitChart