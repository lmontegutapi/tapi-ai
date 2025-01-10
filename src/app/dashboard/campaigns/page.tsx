import { getCampaigns } from "@/actions/campaigns"
import { getAudiences } from "@/actions/audiences"
import { TableWrapper } from "@/components/campaigns/table-wrapper"

export const dynamic = 'force-dynamic';
export default async function CampaignsPage() {
  const [campaigns, audiences] = await Promise.all([
    getCampaigns(),
    getAudiences()
  ])

  if (!campaigns || !audiences) {
    return <div>No se pudo cargar la información de las campañas o audiencias.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <TableWrapper 
        campaigns={campaigns} 
        audiences={audiences.data}
      />
    </div>
  )
}