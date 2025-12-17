# Design Document

## Overview

The Payment Analytics Dashboard is a comprehensive React-based dashboard system featuring 4 specialized sub-dashboards accessible via a top navigation bar. The system displays pre-calculated payment processing data across executive KPIs, compliance monitoring, SLA tracking, and routing analysis. The design emphasizes immediate data visualization without backend recomputation, using the existing chart library with standard color schemes.

## Architecture

### Component Hierarchy
```
PaymentAnalyticsDashboard
├── DashboardNavigation
├── ExecutiveDashboard
│   ├── KPITiles
│   ├── AcquirerCollectionChart
│   ├── NetworkSplitChart
│   ├── CardTypeChart
│   ├── SettlementPeriodTable
│   └── OnUsOffUsChart
├── RateReconciliationDashboard
│   ├── SummaryPanel
│   └── ReconciliationTable
├── SLADelayDashboard
│   ├── SummaryPanel
│   └── SLADelayTable
└── RoutingNonComplianceDashboard
    ├── RoutingKPIs
    └── RoutingErrorTable
```

### Data Flow Architecture
```
Static Data Objects → Dashboard Components → Chart Library → UI Rendering
```

## Components and Interfaces

### 1. Main Dashboard Container

**PaymentAnalyticsDashboard Component**
```typescript
interface PaymentAnalyticsDashboardProps {
  onBack: () => void
}

interface DashboardTab {
  id: string
  name: string
  component: React.ComponentType
}
```

**State Management:**
- `activeTab`: Current dashboard view
- `dashboardData`: Static data objects for all dashboards
- Navigation state and transitions

### 2. Navigation Component

**DashboardNavigation Component**
```typescript
interface NavigationProps {
  tabs: DashboardTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}
```

**Features:**
- Horizontal tab navigation
- Active tab highlighting
- Responsive design for mobile/desktop
- Consistent styling across all views

### 3. Executive Dashboard Components

**KPITiles Component**
```typescript
interface KPITile {
  label: string
  value: string
  format: 'currency' | 'percentage' | 'number' | 'text'
  trend?: 'up' | 'down' | 'neutral'
}

interface KPITilesProps {
  tiles: KPITile[]
}
```

**Chart Components:**
- `AcquirerCollectionChart`: Bar chart for acquirer-wise collections
- `NetworkSplitChart`: Pie chart for network distribution
- `CardTypeChart`: Pie chart for credit/debit split
- `OnUsOffUsChart`: Pie chart for on-us/off-us bifurcation

**SettlementPeriodTable Component:**
```typescript
interface SettlementPeriod {
  acquirer: string
  avgDays: number
  isWarning: boolean
}
```

### 4. Rate Reconciliation Dashboard

**SummaryPanel Component**
```typescript
interface SummaryData {
  totalCollection: string
  transactionErrors: number
  errorPercentage: number
  savingAmount: string
}
```

**ReconciliationTable Component:**
```typescript
interface ReconciliationRow {
  slNo: number
  uniqueId: string
  acquirer: string
  paymentMode: string
  network: string
  cardCategory: string
  transAmount: number
  appliedMDR: number
  agreedMDR: number
  saving: number
}

interface ReconciliationTableProps {
  data: ReconciliationRow[]
  totalRows: number
  onPageChange: (page: number) => void
}
```

### 5. SLA Delay Dashboard

**SLADelayTable Component:**
```typescript
interface SLADelayRow {
  slNo: number
  uniqueId: string
  acquirer: string
  paymentMode: string
  network: string
  cardCategory: string
  transAmount: number
  transDate: string
  settlementDate: string
  delayDays: number
}
```

### 6. Routing Non-Compliance Dashboard

**RoutingKPIs Component:**
```typescript
interface RoutingKPIs {
  totalTransactions: number
  incorrectRouting: number
  routingErrorPercentage: number
  estimatedCostImpact: string
}
```

**RoutingErrorTable Component:**
```typescript
interface RoutingErrorRow {
  txnId: string
  network: string
  cardType: string
  preferredAcquirer: string
  actualAcquirer: string
  costImpact: number
}
```

## Data Models

### Static Data Structure

**Executive Dashboard Data:**
```typescript
const executiveDashboardData = {
  kpis: {
    totalCollection: "₹2,421 Cr",
    totalMDRCost: "₹51.2 Cr",
    mdrCostPercentage: "2.11%",
    numberOfAcquirers: 4,
    timeRange: "01 Jan 2024 – 31 Mar 2024"
  },
  acquirerCollection: [
    { name: "HDFC", value: 1020 },
    { name: "ICICI", value: 740 },
    { name: "Axis", value: 430 },
    { name: "SBI", value: 231 }
  ],
  networkSplit: [
    { name: "VISA", value: 48 },
    { name: "Mastercard", value: 32 },
    { name: "RuPay", value: 15 },
    { name: "Amex", value: 5 }
  ],
  cardType: [
    { name: "Credit", value: 72 },
    { name: "Debit", value: 28 }
  ],
  settlementPeriods: [
    { acquirer: "HDFC", avgDays: 1.8, isWarning: false },
    { acquirer: "ICICI", avgDays: 2.4, isWarning: false },
    { acquirer: "Axis", avgDays: 3.1, isWarning: true },
    { acquirer: "SBI", avgDays: 2.9, isWarning: true }
  ],
  onUsOffUs: [
    { name: "On-us", value: 61 },
    { name: "Off-us", value: 39 }
  ]
}
```

**Rate Reconciliation Data:**
```typescript
const rateReconciliationData = {
  summary: {
    totalCollection: "₹2,421 Cr",
    transactionErrors: 150,
    errorPercentage: 29.5,
    savingAmount: "₹25.6 Cr"
  },
  reconciliationRows: [
    {
      slNo: 1,
      uniqueId: "TXN98231",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 125000,
      appliedMDR: 2.40,
      agreedMDR: 1.85,
      saving: 688
    },
    // ... additional 149 rows
  ]
}
```

**SLA Delay Data:**
```typescript
const slaDelayData = {
  summary: {
    totalCollection: "₹2,421 Cr",
    transactionErrors: 215,
    errorPercentage: 42.3,
    maxDelay: 7
  },
  delayRows: [
    {
      slNo: 1,
      uniqueId: "TXN98231",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 125000,
      transDate: "05-Jan",
      settlementDate: "10-Jan",
      delayDays: 5
    },
    // ... additional rows
  ]
}
```

**Routing Non-Compliance Data:**
```typescript
const routingNonComplianceData = {
  kpis: {
    totalTransactions: 835,
    incorrectRouting: 263,
    routingErrorPercentage: 31.5,
    estimatedCostImpact: "₹8.4 Cr"
  },
  routingErrors: [
    {
      txnId: "TXN98231",
      network: "VISA",
      cardType: "Credit",
      preferredAcquirer: "HDFC",
      actualAcquirer: "Axis",
      costImpact: 312
    },
    // ... additional rows
  ]
}
```

## Error Handling

### Data Validation
- Validate all static data objects on component mount
- Implement fallback values for missing data points
- Handle chart rendering errors gracefully

### User Experience
- Show loading states during dashboard transitions
- Display error messages for failed chart renders
- Implement retry mechanisms for data loading

### Performance Considerations
- Lazy load dashboard components
- Implement virtual scrolling for large tables
- Optimize chart rendering with proper memoization

## Testing Strategy

### Unit Testing
- Test individual dashboard components with mock data
- Validate chart rendering with different data sets
- Test navigation functionality and state management

### Integration Testing
- Test complete dashboard flow with all 4 sub-dashboards
- Validate data consistency across dashboard switches
- Test responsive behavior on different screen sizes

### Visual Testing
- Screenshot testing for chart consistency
- Color scheme validation across all components
- Layout testing for different viewport sizes

### Performance Testing
- Measure dashboard load times
- Test table pagination performance with large datasets
- Validate smooth transitions between dashboard views

## Implementation Notes

### Chart Library Integration
- Use existing chart library with standard color palette
- Implement consistent styling across all chart types
- Ensure accessibility compliance for all visualizations

### Responsive Design
- Mobile-first approach for all dashboard components
- Collapsible navigation for smaller screens
- Adaptive table layouts with horizontal scrolling

### Data Management
- No backend API calls - all data is static
- Implement client-side filtering and sorting
- Use React state management for dashboard navigation

### Styling Approach
- Consistent with existing application theme
- Use CSS modules or styled-components
- Implement dark/light mode compatibility if required