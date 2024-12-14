"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { BadgeDollarSign, Phone, CalendarClock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface DashboardMetricsProps {
  totalReceivables: number
  totalCollected: number
  totalPending: number
  collectionRate: number
  receivablesByStatus: {
    status: string
    count: number
  }[]
  collectionTrend: {
    date: string
    amountCents: number
  }[]
  callsMetrics: {
    total: number
    successful: number
    failed: number
    pending: number
  }
}

export function DashboardMetrics({
  totalReceivables,
  totalCollected,
  totalPending,
  collectionRate,
  receivablesByStatus,
  collectionTrend,
  callsMetrics,
}: DashboardMetricsProps) {
  const chartConfig = {
    receivables: {
      label: "Deudas",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))",
      },
    },
    collected: {
      label: "Cobrado",
      theme: {
        light: "hsl(var(--success))",
        dark: "hsl(var(--success))",
      },
    },
    pending: {
      label: "Pendiente",
      theme: {
        light: "hsl(var(--warning))",
        dark: "hsl(var(--warning))",
      },
    },
    overdue: {
      label: "Vencido",
      theme: {
        light: "hsl(var(--destructive))",
        dark: "hsl(var(--destructive))",
      },
    },
  }

  const statsCards = [
    {
      title: "Total por cobrar",
      value: totalReceivables.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
      icon: BadgeDollarSign,
      trend: "+12.5%",
    },
    {
      title: "Tasa de cobro",
      value: `${collectionRate}%`,
      icon: Users,
      trend: "+2.1%",
    },
    {
      title: "Llamadas realizadas",
      value: callsMetrics.total,
      icon: Phone,
      trend: "+8.1%",
    },
    {
      title: "Promesas de pago",
      value: "24",
      icon: CalendarClock,
      trend: "+3.2%",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.trend}</span> vs mes anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendencia de cobros</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={chartConfig}>
              <LineChart data={collectionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="amountCents"
                  name="collected"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado de deudas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]" config={chartConfig}>
              <PieChart>
                <Pie
                  data={receivablesByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                >
                  {receivablesByStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={
                        entry.status === "OPEN" 
                          ? "hsl(var(--primary))"
                          : entry.status === "OVERDUE"
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--warning))"
                      }
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}