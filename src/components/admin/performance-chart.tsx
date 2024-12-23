"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"

// Función para procesar los datos
function processPerformanceData(data: any[]) {
  return data.reduce((acc: any[], curr) => {
    const date = new Date(curr.createdAt).toLocaleDateString()
    const existing = acc.find(item => item.date === date)
    
    if (existing) {
      if (curr.status === 'CLOSED') {
        existing.collected = (existing.collected || 0) + (curr._sum.amountCents || 0)
      } else {
        existing.pending = (existing.pending || 0) + (curr._sum.amountCents || 0)
      }
    } else {
      acc.push({
        date,
        collected: curr.status === 'CLOSED' ? curr._sum.amountCents : 0,
        pending: curr.status !== 'CLOSED' ? curr._sum.amountCents : 0,
      })
    }
    return acc
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const config = {
  collected: {
    label: "Cobrado",
    theme: {
      light: "var(--success)",
      dark: "var(--success)",
    },
  },
  pending: {
    label: "Pendiente",
    theme: {
      light: "var(--warning)",
      dark: "var(--warning)",
    },
  },
}

export function PerformanceChart({ data }: { data: any[] }) {
  // Procesar datos para el gráfico
  const chartData = processPerformanceData(data)

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${formatCurrency(value)}`}
          />
          <Line
            type="monotone"
            dataKey="collected"
            stroke="var(--success)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="var(--warning)"
            strokeWidth={2}
          />
          <ChartTooltip
            content={({ active, payload }) => (
              <ChartTooltipContent 
                active={active} 
                payload={payload}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
} 