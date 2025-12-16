// Chart data interfaces for Recharts integration

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  percentage?: number
}

export interface BarChartData {
  name: string
  value: number
  fill: string
}

export interface PieChartData {
  name: string
  value: number
  fill: string
  [key: string]: any
}

export interface TrendData {
  date: string
  value: number
}

export interface ChartConfig {
  title: string
  type: 'bar' | 'pie' | 'line'
  data: ChartDataPoint[]
  colors: string[]
  responsive?: boolean
  animated?: boolean
}

// Props interfaces for chart components
export interface BarChartProps {
  data: BarChartData[]
  title: string
  height?: number
  color?: string
  showTooltip?: boolean
  animated?: boolean
}

export interface PieChartProps {
  data: PieChartData[]
  title: string
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  animated?: boolean
}

export interface TrendLineProps {
  data: TrendData[]
  height?: number
  color?: string
  showDots?: boolean
  animated?: boolean
}

export interface ChartContainerProps {
  title: string
  children: React.ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
}