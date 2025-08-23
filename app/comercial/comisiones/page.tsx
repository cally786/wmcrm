import { AppLayout } from "@/components/layout/app-layout"
import { CommissionsGrid } from "@/components/commissions/commissions-grid"

export default function CommissionsPage() {
  const breadcrumbs = [{ label: "Comercial" }, { label: "Comisiones" }]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="h-full">
        <CommissionsGrid />
      </div>
    </AppLayout>
  )
}
