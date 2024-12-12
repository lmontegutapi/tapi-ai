import { DashboardMetrics } from "@/components/dashboard/metrics"
import { prisma } from "@/lib/db"

async function getDashboardData() {
  // Aquí irían las queries reales a tu base de datos
  const totalReceivables = await prisma.receivable.count()
  const totalCollected = await prisma.receivable.count({
    where: { status: "CLOSED" }
  })
  
  // Ejemplo de datos mockeados
  return {
    totalReceivables: 250000,
    totalCollected: 150000,
    totalPending: 100000,
    collectionRate: 75,
    receivablesByStatus: [
      { status: "OPEN", count: 45 },
      { status: "OVERDUE", count: 30 },
      { status: "CLOSED", count: 25 }
    ],
    collectionTrend: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      amount: Math.floor(Math.random() * 50000) + 10000
    })).reverse(),
    callsMetrics: {
      total: 250,
      successful: 180,
      failed: 40,
      pending: 30
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <DashboardMetrics {...data} />
    </div>
  )
}