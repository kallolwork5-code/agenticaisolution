'use client'

import React from 'react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { TrendLineProps } from '@/lib/chart-types'

const TrendLineChart: React.FC<TrendLineProps> = ({
  data,
  height = 60,
  color = "#10b981",
  showDots = false,
  animated = true
}) => {
  // Custom tooltip for trend lines
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-2 shadow-lg">
          <p className="text-white text-xs">{label}</p>
          <p className="text-green-400 text-xs">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={showDots ? { fill: color, strokeWidth: 0, r: 3 } : false}
          animationDuration={animated ? 1000 : 0}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TrendLineChart