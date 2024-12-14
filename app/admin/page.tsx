import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PerformanceChart } from "@/components/admin/performance-chart";
import { StatusDistributionChart } from "@/components/admin/status-distribution-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { prisma } from "@/lib/db";
import { session } from "@/lib/auth-server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserRole } from "@/lib/constants/roles";

async function getDashboardData() {
  const auth = await session();
  if (auth?.user?.role?.toUpperCase() !== UserRole.SUPER_ADMIN) {
    return null;
  }

  try {
    const [
      organizations,
      users,
      metrics,
      recentActivity,
      totalMetrics
    ] = await Promise.allSettled([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.receivable.groupBy({
        by: ['status'],
        _sum: { amountCents: true },
        _count: true
      }),
      prisma.activity.findFirst().then(async (exists) => {
        if (exists) {
          return prisma.activity.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true, receivable: true }
          });
        }
        return [];
      }),
      prisma.receivable.aggregate({
        _sum: {
          amountCents: true
        },
        _count: true
      })
    ]);

    return {
      organizations: organizations.status === 'fulfilled' ? organizations.value : 0,
      users: users.status === 'fulfilled' ? users.value : 0,
      metrics: metrics.status === 'fulfilled' ? metrics.value : [],
      recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : [],
      totalMetrics: totalMetrics.status === 'fulfilled' ? totalMetrics.value : { _sum: { amountCents: 0 }, _count: 0 }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return {
      organizations: 0,
      users: 0,
      metrics: [],
      recentActivity: [],
      totalMetrics: { _sum: { amountCents: 0 }, _count: 0 }
    };
  }
}

export default async function AdminPage() {
  const data = await getDashboardData();
  
  if (!data) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">No tienes permisos para ver esta página</p>
      </div>
    );
  }

  const { organizations, users, metrics, recentActivity, totalMetrics } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deudas Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMetrics._sum.amountCents || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics._count} deudas totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Deuda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMetrics._count ? (totalMetrics._sum.amountCents || 0) / totalMetrics._count : 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución Global de Deudas</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart data={metrics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Cobranza</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={metrics} />
          </CardContent>
        </Card>
      </div>

      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity items={recentActivity} />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 