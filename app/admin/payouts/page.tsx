import { AppLayout } from "@/components/layout/app-layout"
import { PayoutsCalendar } from "@/components/payouts/payouts-calendar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AdminPayoutsPage() {
  const breadcrumbs = [{ label: "Admin" }, { label: "Payouts" }]

  return (
    <RoleGuard requiredRole="admin">
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="h-full">
          <PayoutsCalendar />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}
