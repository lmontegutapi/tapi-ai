"use client"

import { Campaign, Audience } from "@prisma/client"
import { CampaignsTable } from "./table"
import { columns } from "./columns"
import { useCampaignsStore } from "@/stores/campaigns.store"
import { useEffect } from "react"
import { CampaignDialog } from "./campaign-dialog"

interface TableWrapperProps {
  campaigns: Campaign[]
  audiences?: Audience[]
}

export function TableWrapper({ campaigns, audiences }: TableWrapperProps) {
  const { setAudiences } = useCampaignsStore()

  useEffect(() => {
    setAudiences(audiences || [])
  }, [audiences, setAudiences])

  return <CampaignsTable columns={columns} data={campaigns} renderCreateButton={() => <CampaignDialog />} />
}