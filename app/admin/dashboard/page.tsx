import { AppLayout } from "@/components/layout/app-layout"
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards"
import { TopSalesChart } from "@/components/admin/top-sales-chart"
import { PendingApprovals } from "@/components/admin/pending-approvals"
import { GeographicMap } from "@/components/admin/geographic-map"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AdminDashboardPage() {
  const breadcrumbs = [{ label: "Admin" }, { label: "Dashboard" }]

  return (
    <RoleGuard requiredRole="admin">
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* KPI Cards */}
          <AdminKpiCards />

          {/* Charts and Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSalesChart />
            <PendingApprovals />
          </div>

          {/* Geographic Distribution */}
          <GeographicMap />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}
