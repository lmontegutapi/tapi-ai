import { getAudienceDetails } from "@/actions/audiences"
import { AudienceSummaryView } from "@/components/audiences/summary-view"
import { notFound } from "next/navigation"

export default async function AudiencePage({ params }: { params: { id: string } }) {
  const audienceDetails = await getAudienceDetails(params.id);

  if (!audienceDetails) { 
    return notFound();
  }

  return <AudienceSummaryView audienceDetails={audienceDetails} />;
}