import { AppLayout } from "@/components/layout/app-layout"
import { EventsGrid } from "@/components/events/events-grid"

export default function EventsPage() {
  const breadcrumbs = [{ label: "Comercial" }, { label: "Eventos" }]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="h-full">
        <EventsGrid />
      </div>
    </AppLayout>
  )
}
