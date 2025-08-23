import { AppLayout } from "@/components/layout/app-layout"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { CommissionChart } from "@/components/dashboard/commission-chart"
import { UpcomingActivities } from "@/components/dashboard/upcoming-activities"
import { PipelineStatus } from "@/components/dashboard/pipeline-status"

async function getDashboardData() {
  try {
    const response = await fetch('http://localhost:3000/api/dashboard', {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      console.error('Failed to fetch dashboard data:', response.statusText)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

export default async function DashboardPage() {
  const breadcrumbs = [{ label: "Comercial" }, { label: "Dashboard" }]
  const dashboardData = await getDashboardData()

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* KPI Cards Grid */}
        <KpiCards data={dashboardData?.kpis} />

        {/* Charts and Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommissionChart data={dashboardData?.commissionChart} />
          <UpcomingActivities data={dashboardData?.upcomingEvents} />
        </div>

        {/* Pipeline Status */}
        <PipelineStatus />
      </div>
    </AppLayout>
  )
}
