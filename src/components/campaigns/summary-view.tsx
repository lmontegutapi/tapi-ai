import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function CampaignSummaryView({ campaign }: { campaign: any }) {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.objective}</p>
        </div>
        <Badge variant="outline">{campaign.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Total Llamadas"
                value={campaign.totalCalls}
              />
              <MetricCard
                title="Completadas"
                value={campaign.completedCalls}
              />
              <MetricCard
                title="Exitosas"
                value={campaign.successfulCalls}
              />
              <MetricCard
                title="Fallidas"
                value={campaign.failedCalls}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium">Período</dt>
                  <dd>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Horario</dt>
                  <dd>{campaign.startTime} - {campaign.endTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Intentos por contacto</dt>
                  <dd>{campaign.callsPerUser}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agente AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{campaign.voiceName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{campaign.voiceName}</p>
                    <p className="text-sm text-muted-foreground">ID: {campaign.agentId}</p>
                  </div>
                </div>
                {campaign.voicePreviewUrl && (
                  <audio controls className="w-full">
                    <source src={campaign.voicePreviewUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: number }) {
  return (
    <div className="flex flex-col p-4 bg-muted rounded-md">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}