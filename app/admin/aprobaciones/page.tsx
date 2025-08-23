import { AppLayout } from "@/components/layout/app-layout"
import { ApprovalsGrid } from "@/components/admin/approvals-grid"
import { RoleGuard } from "@/components/auth/role-guard"

export default function ApprovalsPage() {
  const breadcrumbs = [{ label: "Admin" }, { label: "Aprobaciones" }]

  return (
    <RoleGuard requiredRole="admin">
      <AppLayout breadcrumbs={breadcrumbs}>
        <div className="h-full">
          <ApprovalsGrid />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}
