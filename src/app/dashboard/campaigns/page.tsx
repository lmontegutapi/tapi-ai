import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { CampaignsTable } from "@/components/campaigns/table";
import { columns } from "@/components/campaigns/columns";
import { TableSkeleton } from "@/components/table-skeleton";
import { CampaignDrawer } from "@/components/campaigns/campaigns-drawer";
import { getCampaigns } from "@/actions/campaigns";
import { EmptyCampaigns } from "@/components/campaigns/empty-campaigns";
import { getAudiences } from "@/actions/audiences";
import { Audience } from "@prisma/client";
import { TableWrapper } from "@/components/campaigns/table-wrapper";

export default async function CampaignsPage() {
  const [campaignsResult, audiencesResult] = await Promise.all([
    getCampaigns(),
    getAudiences()
  ]);

  const campaigns = campaignsResult || [];
  const audiences = audiencesResult.data || [];

  console.log("campaignsResult", campaignsResult);
  console.log("audiencesResult", audiencesResult);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campañas</h2>
          <p className="text-muted-foreground">
            Gestiona tus campañas de cobranza y realiza llamadas automáticas
          </p>
        </div>
       {/*  <CampaignDrawer audiences={audiencesResult.data} /> */}
      </div>
      <Separator />
      {!campaigns.length ? (
        <EmptyCampaigns />
      ) : (
        <Suspense fallback={<TableSkeleton columnCount={7} rowCount={5} />}>
          {/* <TableWrapper campaigns={campaigns} audiences={audiencesResult.data} /> */}
          <CampaignsTable 
            columns={columns} 
            data={campaigns}
            renderCreateButton={() => (
              <CampaignDrawer audiences={audiences} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}