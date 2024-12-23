import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { CampaignsTable } from "@/components/campaigns/table";
import { columns } from "@/components/campaigns/columns";
import { TableSkeleton } from "@/components/table-skeleton";
import { CampaignDrawer } from "@/components/campaigns/campaigns-drawer";
import { getCampaigns } from "@/actions/campaigns";
import { getReceivables } from "@/actions/receivables";
import { EmptyCampaigns } from "@/components/campaigns/empty-campaigns";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  
  const receivablesResponse = await getReceivables();
  const receivables = Array.isArray(receivablesResponse)
    ? receivablesResponse
    : [];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campañas</h2>
          <p className="text-muted-foreground">
            Gestiona tus campañas de cobranza y realiza llamadas automáticas
          </p>
        </div>
        <CampaignDrawer receivables={receivables} />
      </div>
      <Separator />
      {!campaigns || campaigns.length === 0 ? (
        <EmptyCampaigns />
      ) : (
        <Suspense fallback={<TableSkeleton columnCount={7} rowCount={5} />}>
          <CampaignsTable columns={columns} data={campaigns} 
            receivables={receivables}
          />
        </Suspense>
      )}
    </div>
  );
}
