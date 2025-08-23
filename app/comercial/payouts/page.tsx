import { AppLayout } from "@/components/layout/app-layout"
import { CommercialPayouts } from "@/components/payouts/commercial-payouts"

export default function CommercialPayoutsPage() {
  const breadcrumbs = [{ label: "Comercial" }, { label: "Payouts" }]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="h-full">
        <CommercialPayouts />
      </div>
    </AppLayout>
  )
}
