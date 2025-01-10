import { DashboardMetrics } from "@/components/dashboard/metrics"
import { getDashboardData } from "@/actions/dashboard"
export const dynamic = 'force-dynamic';
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