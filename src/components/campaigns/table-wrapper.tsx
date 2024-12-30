"use client"

import { CampaignsTable } from "./table"
import { CampaignDrawer } from "./campaigns-drawer"
import { columns } from "./columns"

export function TableWrapper({ 
  campaigns, 
  audiences 
}: { 
  campaigns: any[],
  audiences: any[]
}) {
  return (
    <CampaignsTable 
      columns={columns} 
      data={campaigns}
      renderCreateButton={() => (
        <CampaignDrawer audiences={audiences} />
      )}
    />
  );
}