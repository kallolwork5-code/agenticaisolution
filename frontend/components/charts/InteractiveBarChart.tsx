'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { BarChartProps } from '@/lib/chart-types'

const InteractiveBarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  color = "#10b981",
  showTooltip = true,
  animated = true
}) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-green-400">
            Value: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255,255,255,0.1)" 
          vertical={false}
        />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: 'rgba(255,255,255,0.7)', 
            fontSize: 12,
            fontWeight: 500
          }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fill: 'rgba(255,255,255,0.7)', 
            fontSize: 12 
          }}
        />
        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          />
        )}
        <Bar 
          dataKey="value" 
          fill={color}
          radius={[4, 4, 0, 0]}
          animationDuration={animated ? 1000 : 0}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default InteractiveBarChart