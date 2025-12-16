'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import DataManagement from '@/components/dashboard/DataManagement'

export default function DataManagementPage() {
  return (
    <DashboardLayout
      title="Data Management"
      description="Upload and process your transaction data files with schema-agnostic processing"
    >
      <DataManagement />
    </DashboardLayout>
  )
}