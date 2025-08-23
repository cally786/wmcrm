import { AppLayout } from "@/components/layout/app-layout"
import { PipelineKanban } from "@/components/pipeline/pipeline-kanban"

export default function PipelinePage() {
  const breadcrumbs = [{ label: "Comercial" }, { label: "Pipeline" }]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="h-full">
        <PipelineKanban />
      </div>
    </AppLayout>
  )
}
