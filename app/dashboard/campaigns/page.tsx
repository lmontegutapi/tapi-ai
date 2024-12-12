import { Suspense } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CampaignsTable } from "@/components/campaigns/table"
import { columns } from "@/components/campaigns/columns"
import Link from "next/link"
import { TableSkeleton } from "@/components/table-skeleton"
import { getCampaigns } from "@/actions/campaigns"

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campañas</h2>
          <p className="text-muted-foreground">
            Gestiona tus campañas de cobranza y realiza llamadas automáticas
          </p>
        </div>
      </div>
      <Separator />
      <Suspense fallback={<TableSkeleton columnCount={7} rowCount={5} />}>
        <CampaignsTable columns={columns} data={campaigns} />
      </Suspense>
    </div>
  )
}