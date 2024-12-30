import { getCampaignWithCalls } from "@/actions/campaigns"
import { CampaignSummaryView } from "@/components/campaigns/summary-view"
import { notFound } from "next/navigation"

export default async function CampaignPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const campaign = await getCampaignWithCalls(params.id);
  if (!campaign) return notFound();

  return <CampaignSummaryView campaign={campaign} />;
}