"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

const config = {
  OPEN: {
    label: "Pendiente",
    theme: {
      light: "hsl(var(--warning))",
      dark: "hsl(var(--warning))",
    },
  },
  CLOSED: {
    label: "Cobrado",
    theme: {
      light: "hsl(var(--success))",
      dark: "hsl(var(--success))",
    },
  },
  OVERDUE: {
    label: "Vencido",
    theme: {
      light: "hsl(var(--destructive))",
      dark: "hsl(var(--destructive))",
    },
  },
  PENDING_DUE: {
    label: "Por vencer",
    theme: {
      light: "hsl(var(--muted))",
      dark: "hsl(var(--muted))",
    },
  },
}

function processStatusData(data: any[]) {
  return data.map(item => ({
    name: item.status,
    value: item._sum.amountCents || 0,
    count: item._count,
  }))
}

export function StatusDistributionChart({ data }: { data: any[] }) {
  const chartData = processStatusData(data)

  return (
    <ChartContainer config={config}>
      <>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={config[entry.name as keyof typeof config].theme.light}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <p className="text-sm font-medium">
                            {config[payload[0].name as keyof typeof config].label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend
          className="mt-6"
          payload={chartData.map((entry) => ({
            value: entry.name,
            color: config[entry.name as keyof typeof config].theme.light,
          }))}
        />
      </>
    </ChartContainer>
  )
} 