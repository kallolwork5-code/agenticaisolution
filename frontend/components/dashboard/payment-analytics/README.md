# Payment Analytics Dashboard

A comprehensive 4-dashboard system for payment processing analytics with pre-calculated data visualization.

## Structure

```
payment-analytics/
├── index.ts                    # Component exports
├── types.ts                    # TypeScript interfaces
├── data.ts                     # Static data objects
├── utils.ts                    # Utility functions
├── constants.ts                # Configuration constants
├── PaymentAnalyticsDashboard.tsx   # Main container
├── DashboardNavigation.tsx     # Top navigation bar
├── executive/                  # Executive Dashboard components
├── rate-reconciliation/        # Rate Reconciliation components
├── sla-delay/                  # SLA Delay components
└── routing/                    # Routing Non-Compliance components
```

## Dashboards

### 1. Executive Dashboard
- **KPI Tiles**: Total Collection, MDR Cost, etc.
- **Charts**: Acquirer collection, Network split, Card types
- **Table**: Settlement periods with warnings

### 2. Rate Reconciliation
- **Summary Panel**: Collection, Errors, Savings
- **Table**: Transaction errors with MDR discrepancies

### 3. SLA Delay
- **Summary Panel**: Collection, Errors, Max delay
- **Table**: Settlement delays with timing analysis

### 4. Routing Non-Compliance
- **KPIs**: Transaction routing errors and cost impact
- **Table**: Routing mismatches between preferred/actual acquirers

## Data Structure

All data is **pre-calculated** and stored in `data.ts`. No backend computation required.

### Key Data Objects:
- `executiveDashboardData`: KPIs and chart data
- `rateReconciliationData`: MDR errors and savings
- `slaDelayData`: Settlement timing issues
- `routingNonComplianceData`: Routing errors and costs

## Features

- ✅ **Static Data**: No backend recomputation
- ✅ **Responsive Design**: Mobile and desktop support
- ✅ **Interactive Tables**: Pagination, sorting, filtering
- ✅ **Standard Colors**: Uses existing chart library palette
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Performance**: Optimized rendering and navigation

## Usage

```tsx
import { PaymentAnalyticsDashboard } from './components/dashboard/payment-analytics'

function App() {
  return (
    <PaymentAnalyticsDashboard 
      onBack={() => console.log('Navigate back')} 
    />
  )
}
```

## Development

1. **Add new components** in respective subdirectories
2. **Update exports** in `index.ts`
3. **Extend types** in `types.ts` as needed
4. **Add utilities** in `utils.ts` for common functions
5. **Configure constants** in `constants.ts`

## Data Format

The dashboard displays exact values as specified:
- Total Collection: ₹2,421 Cr
- MDR Cost: ₹51.2 Cr (2.11%)
- Transaction Errors: 150 (Rate), 215 (SLA), 263 (Routing)
- Savings: ₹25.6 Cr (Rate), ₹8.4 Cr (Routing)

All data matches the provided specifications exactly.