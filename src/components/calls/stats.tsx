"use client"

import { Call } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, CheckCircle2, XCircle, Clock } from "lucide-react"

interface CallsStatsProps {
  calls: Call[]
}

export function CallsStats({ calls }: CallsStatsProps) {
  const totalCalls = calls.length
  const completedCalls = calls.filter(call => call.status === "COMPLETED").length
  const failedCalls = calls.filter(call => call.status === "FAILED").length
  const pendingCalls = calls.filter(call => call.status === "SCHEDULED").length
  const successRate = totalCalls ? (completedCalls / totalCalls) * 100 : 0
  const avgDuration = calls.reduce((acc, call) => acc + (call.duration || 0), 0) / completedCalls || 0

  const stats = [
    {
      title: "Total Llamadas",
      value: totalCalls,
      icon: Phone,
    },
    {
      title: "Completadas",
      value: `${successRate.toFixed(1)}%`,
      icon: CheckCircle2,
    },
    {
      title: "Fallidas",
      value: failedCalls,
      icon: XCircle,
    },
    {
      title: "Duración Promedio",
      value: `${Math.round(avgDuration)}s`,
      icon: Clock,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}