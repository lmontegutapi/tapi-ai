"use client"

import { Campaign, Audience } from "@prisma/client"
import { CampaignsTable } from "./table"
import { columns } from "./columns"
import { CampaignsDrawer } from "./campaigns-drawer"
import { Agent } from "@/types/agent"

interface TableWrapperProps {
  campaigns: Campaign[]
  agents?: Agent[]
  audiences?: Audience[]
}

export function TableWrapper({ campaigns, agents, audiences }: TableWrapperProps) {
  return (
    <CampaignsTable
      columns={columns}
      data={campaigns}
      renderCreateButton={() => (
        <CampaignsDrawer
          agents={agents}
          audiences={audiences}
        />
      )}
    />
  )
}