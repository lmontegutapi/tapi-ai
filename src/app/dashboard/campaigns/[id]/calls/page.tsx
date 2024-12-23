// app/dashboard/campaigns/[id]/calls/page.tsx
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCampaignWithCalls } from "@/actions/campaigns"
import { CallsTable } from "@/components/calls/table"
import { CallsStats } from "@/components/calls/stats"
import { TableSkeleton } from "@/components/table-skeleton"
import { Separator } from "@/components/ui/separator"

export default async function CampaignCallsPage({
  params
}: {
  params: { id: string }
}) {
  const campaign = await getCampaignWithCalls(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Llamadas de Campaña
        </h2>
        <p className="text-muted-foreground">
          {campaign.name} - Historial de llamadas y estadísticas
        </p>
      </div>
      <Separator />
      <Suspense fallback={<div className="h-[100px] animate-pulse" />}>
        <CallsStats calls={campaign.calls} />
      </Suspense>
      <Suspense fallback={<TableSkeleton columnCount={6} rowCount={5} />}>
        <CallsTable calls={campaign.calls} />
      </Suspense>
    </div>
  )
}