import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export function CampaignsList({ campaigns }: { campaigns: any[] }) {
  return (
    <div className="space-y-8">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium leading-none">{campaign.name}</p>
            <p className="text-sm text-muted-foreground">
              {campaign._count.receivables} deudas asignadas
            </p>
          </div>
          <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>
      ))}
    </div>
  )
} 