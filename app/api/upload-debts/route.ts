import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export interface DebtUpload {
  name: string
  amountInCents: number
  dueDate: Date
  phone: string
}

export async function POST(request: Request) {
  try {
    const debts: DebtUpload[] = await request.json()

    const results = await Promise.all(
      debts.map(async (debt) => {
        // Buscar o crear cliente
        const client = await prisma.client.upsert({
          where: { phone: debt.phone },
          update: {},
          create: {
            name: debt.name,
            phone: debt.phone,
          },
        })

        // Crear deuda
        const debtRecord = await prisma.debt.create({
          data: {
            amountInCents: debt.amountInCents,
            dueDate: debt.dueDate.toISOString(),
            status: debt.dueDate < new Date() ? 'OVERDUE' : 'PENDING',
            clientId: client.id,
          },
        })

        return debtRecord
      })
    )

    return NextResponse.json({
      success: true,
      count: results.length,
    })

  } catch (error) {
    console.error('Error al procesar deudas:', error)
    return NextResponse.json(
      { error: 'Error al procesar las deudas' },
      { status: 500 }
    )
  }
}