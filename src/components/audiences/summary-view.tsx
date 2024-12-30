"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getAudienceDetails } from "@/actions/audiences"

export function AudienceSummaryView({ 
  audienceDetails 
}: { 
  audienceDetails: Awaited<ReturnType<typeof getAudienceDetails>> 
}) {
  if (!audienceDetails) return null;
  const { audience, metrics, receivables, contacts } = audienceDetails;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{audience.name}</h1>
          <p className="text-muted-foreground">{audience.description}</p>
        </div>
        <Badge variant="outline">
          {audience.delinquencyBucket === "CURRENT" ? "Al día" :
           audience.delinquencyBucket === "PAST_DUE_30" ? "30 días" : 
           audience.delinquencyBucket === "PAST_DUE_60" ? "60 días" : "90+ días"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Métricas Principales */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                title="Total Deuda"
                value={formatCurrency(metrics.totalAmount)}
              />
              <MetricCard
                title="Deudas"
                value={metrics.totalReceivables}
              />
              <MetricCard
                title="Contactos"
                value={metrics.totalContacts}
              />
              <MetricCard
                title="Campañas"
                value={metrics.campaignsCount}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Deudas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Deudas</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              {receivables.slice(0, 5).map((receivable) => (
                <div
                  key={receivable.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{receivable.contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence: {formatDate(receivable.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(receivable.amountCents)}
                    </p>
                    <Badge variant={
                      receivable.status === "OPEN" ? "default" : 
                      receivable.status === "OVERDUE" ? "destructive" : 
                      "secondary"
                    }>
                      {receivable.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Campañas Activas */}
        <Card>
          <CardHeader>
            <CardTitle>Campañas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              {audience.campaigns
                .filter(c => c.status === "ACTIVE")
                .map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {campaign.completedCalls}/{campaign.totalCalls} llamadas
                      </p>
                      <Badge variant="default">
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}