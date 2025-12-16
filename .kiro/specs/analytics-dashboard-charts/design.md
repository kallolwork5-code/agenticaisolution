# Design Document

## Overview

This design document outlines the integration of a professional charting library to replace the current CSS-based dummy charts in the CollectiSense Analytics Dashboard. The solution will use Recharts, a composable charting library built on React components and D3, to provide interactive, responsive, and visually appealing data visualizations.

## Architecture

### Library Selection: Recharts

**Rationale for Recharts:**
- **React Native**: Built specifically for React applications
- **Lightweight**: Smaller bundle size compared to Chart.js + react-chartjs-2
- **TypeScript Support**: Full TypeScript support out of the box
- **Responsive**: Built-in responsive design capabilities
- **Customizable**: Highly customizable with React component patterns
- **Performance**: Optimized for React rendering cycles
- **Active Maintenance**: Well-maintained with regular updates

### Component Architecture

```
AnalyticsDashboard.tsx
├── MetricCard (enhanced with trend lines)
├── InteractiveBarChart (Recharts BarChart)
├── InteractivePieChart (Recharts PieChart)
├── TrendLineChart (Recharts LineChart)
└── ChartContainer (wrapper with loading/error states)
```

### Data Flow Architecture

```
Analytics Dashboard → Chart Components → Recharts Library → SVG Rendering
       ↓                    ↓                ↓              ↓
   Static Data         Props/Config      D3 Calculations   DOM Elements
```

## Components and Interfaces

### 1. Chart Data Interfaces

```typescript
interface ChartDataPoint {
  label: string
  value: number
  color?: string
  percentage?: number
}

interface BarChartData {
  name: string
  value: number
  fill: string
}

interface PieChartData {
  name: string
  value: number
  fill: string
}

interface TrendData {
  date: string
  value: number
}

interface ChartConfig {
  title: string
  type: 'bar' | 'pie' | 'line'
  data: ChartDataPoint[]
  colors: string[]
  responsive?: boolean
  animated?: boolean
}
```

### 2. Enhanced Chart Components

#### InteractiveBarChart Component
```typescript
interface BarChartProps {
  data: BarChartData[]
  title: string
  height?: number
  color?: string
  showTooltip?: boolean
  animated?: boolean
}

const InteractiveBarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 300,
  color = "#10b981",
  showTooltip = true,
  animated = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        {showTooltip && (
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
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
```

#### InteractivePieChart Component
```typescript
interface PieChartProps {
  data: PieChartData[]
  title: string
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  animated?: boolean
}

const InteractivePieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showTooltip = true,
  animated = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationDuration={animated ? 1000 : 0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        )}
        {showLegend && (
          <Legend 
            wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
```

#### TrendLineChart Component
```typescript
interface TrendLineProps {
  data: TrendData[]
  height?: number
  color?: string
  showDots?: boolean
  animated?: boolean
}

const TrendLineChart: React.FC<TrendLineProps> = ({
  data,
  height = 60,
  color = "#10b981",
  showDots = false,
  animated = true
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={showDots}
          animationDuration={animated ? 1000 : 0}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### 3. Chart Container with Loading States

```typescript
interface ChartContainerProps {
  title: string
  children: React.ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading = false,
  error,
  onRetry
}) => {
  return (
    <motion.div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-green-400" />
        </div>
      </div>
      
      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <ChartError message={error} onRetry={onRetry} />
      ) : (
        children
      )}
    </motion.div>
  )
}
```

## Data Models

### Chart Configuration Data

```typescript
// Acquirer Performance Data
const acquirerData: BarChartData[] = [
  { name: 'HDFC', value: 85, fill: '#10b981' },
  { name: 'ICICI', value: 72, fill: '#34d399' },
  { name: 'SBI', value: 68, fill: '#6ee7b7' },
  { name: 'Axis', value: 45, fill: '#ffffff' },
  { name: 'Kotak', value: 38, fill: '#a7f3d0' }
]

// Network Distribution Data
const networkData: PieChartData[] = [
  { name: 'Visa', value: 45, fill: '#10b981' },
  { name: 'Mastercard', value: 30, fill: '#34d399' },
  { name: 'RuPay', value: 20, fill: '#ffffff' },
  { name: 'Amex', value: 5, fill: '#6ee7b7' }
]

// Trend Data for Metrics
const trendData: TrendData[] = [
  { date: '2024-12-09', value: 42000 },
  { date: '2024-12-10', value: 45000 },
  { date: '2024-12-11', value: 43000 },
  { date: '2024-12-12', value: 47000 },
  { date: '2024-12-13', value: 46000 },
  { date: '2024-12-14', value: 48000 },
  { date: '2024-12-15', value: 45678 }
]
```

## Error Handling

### Chart Error Handling Strategy

1. **Loading States**: Show skeleton loaders while charts initialize
2. **Data Validation**: Validate chart data before rendering
3. **Fallback UI**: Display error messages with retry options
4. **Graceful Degradation**: Show static placeholders if library fails to load

```typescript
const ChartSkeleton: React.FC = () => (
  <div className="h-48 bg-white/5 rounded-xl animate-pulse">
    <div className="h-full flex items-end justify-center gap-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="bg-white/20 rounded-t"
          style={{ 
            width: '20px', 
            height: `${Math.random() * 100 + 50}px` 
          }}
        />
      ))}
    </div>
  </div>
)

const ChartError: React.FC<{ message: string; onRetry?: () => void }> = ({ 
  message, 
  onRetry 
}) => (
  <div className="h-48 bg-white/5 rounded-xl flex flex-col items-center justify-center">
    <p className="text-white/60 text-sm mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-green-500 text-black rounded-lg text-sm hover:bg-green-400 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
)
```

## Testing Strategy

### Component Testing
1. **Chart Rendering**: Test that charts render with provided data
2. **Interaction Testing**: Test hover effects, tooltips, and click events
3. **Responsive Testing**: Test chart behavior on different screen sizes
4. **Error State Testing**: Test loading and error state displays

### Integration Testing
1. **Data Flow**: Test data transformation from props to chart display
2. **Animation Testing**: Test chart animations and transitions
3. **Performance Testing**: Test rendering performance with large datasets

### Visual Regression Testing
1. **Chart Appearance**: Ensure charts maintain visual consistency
2. **Theme Integration**: Test charts match dashboard color scheme
3. **Responsive Layout**: Test chart layouts on mobile/tablet/desktop

## Implementation Approach

### Phase 1: Library Integration
1. Install Recharts dependency
2. Create base chart components
3. Implement chart container with loading states

### Phase 2: Chart Implementation
1. Replace CSS bar charts with Recharts BarChart
2. Replace CSS pie charts with Recharts PieChart
3. Add trend line charts to metric cards

### Phase 3: Enhancement and Testing
1. Add interactive features (tooltips, hover effects)
2. Implement responsive design
3. Add error handling and loading states
4. Performance optimization

## Performance Considerations

### Bundle Size Optimization
- **Tree Shaking**: Import only required Recharts components
- **Code Splitting**: Lazy load chart components if needed
- **Bundle Analysis**: Monitor bundle size impact

### Rendering Performance
- **Memoization**: Use React.memo for chart components
- **Data Optimization**: Optimize data structures for chart rendering
- **Animation Control**: Provide option to disable animations for performance

### Memory Management
- **Component Cleanup**: Proper cleanup of chart instances
- **Event Listeners**: Remove event listeners on unmount
- **Data Caching**: Cache chart data to prevent unnecessary re-renders

## Accessibility Considerations

### ARIA Support
- **Labels**: Proper ARIA labels for chart elements
- **Descriptions**: Screen reader friendly chart descriptions
- **Keyboard Navigation**: Support for keyboard navigation

### Color Accessibility
- **Contrast**: Ensure sufficient color contrast
- **Color Blind Support**: Use patterns in addition to colors
- **Alternative Text**: Provide text alternatives for visual data

## Migration Strategy

### Backward Compatibility
1. **Gradual Migration**: Replace charts one by one
2. **Feature Flags**: Use feature flags to toggle between old/new charts
3. **Fallback Support**: Maintain CSS charts as fallback

### Data Structure Compatibility
1. **Data Transformation**: Transform existing data to Recharts format
2. **API Compatibility**: Maintain existing component APIs
3. **Configuration Migration**: Migrate chart configurations smoothly