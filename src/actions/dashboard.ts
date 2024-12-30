import { prisma } from "@/lib/db";
import { session as sessionServer } from "@/lib/auth-server";

export async function getDashboardData() {
  const session = await sessionServer();
  if (!session) throw new Error("No autorizado");

  const organization = await prisma.organization.findFirst({
    where: {
      members: { some: { userId: session.user.id } }
    }
  });

  if (!organization) throw new Error("Organización no encontrada");

  // Métricas de cobranza
  const receivables = await prisma.receivable.findMany({
    where: {
      organizationId: organization.id
    }
  });

  const totalReceivables = receivables.reduce((sum, r) => sum + r.amountCents, 0);
  const totalCollected = await prisma.receivable.aggregate({
    where: {
      organizationId: organization.id,
      status: "CLOSED"
    },
    _sum: {
      amountCents: true
    }
  });

  // Estado de deudas
  const receivablesByStatus = await prisma.receivable.groupBy({
    by: ['status'],
    where: {
      organizationId: organization.id
    },
    _count: {
      id: true
    }
  });

  // Tendencia de cobros (últimos 7 días)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const collectionTrend = await prisma.receivable.groupBy({
    by: ['updatedAt'],
    where: {
      organizationId: organization.id,
      status: "CLOSED",
      updatedAt: {
        gte: sevenDaysAgo
      }
    },
    _sum: {
      amountCents: true
    },
    orderBy: {
      updatedAt: 'asc'
    }
  });

  // Métricas de llamadas
  const callsMetrics = await prisma.call.groupBy({
    by: ['status'],
    where: {
      receivable: {
        organizationId: organization.id
      }
    },
    _count: {
      id: true
    }
  });

  // Calcular tasa de cobro
  const collectionRate = totalCollected._sum.amountCents 
    ? Math.round((totalCollected._sum.amountCents / totalReceivables) * 100)
    : 0;

  return {
    totalReceivables: totalReceivables / 100, // Convertir centavos a pesos
    totalCollected: (totalCollected._sum.amountCents || 0) / 100,
    totalPending: (totalReceivables - (totalCollected._sum.amountCents || 0)) / 100,
    collectionRate,
    receivablesByStatus: receivablesByStatus.map(status => ({
      status: status.status,
      count: status._count.id
    })),
    collectionTrend: collectionTrend.map(trend => ({
      date: trend.updatedAt.toLocaleDateString(),
      amountCents: (trend._sum.amountCents || 0) / 100
    })),
    callsMetrics: {
      total: callsMetrics.reduce((sum, status) => sum + status._count.id, 0),
      successful: callsMetrics.find(s => s.status === "COMPLETED")?._count.id || 0,
      failed: callsMetrics.find(s => s.status === "FAILED")?._count.id || 0,
      pending: callsMetrics.find(s => s.status === "SCHEDULED")?._count.id || 0
    }
  };
}
