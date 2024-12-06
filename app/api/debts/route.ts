
import { NextResponse } from "next/server"
import { prisma } from '@/lib/db'

export async function GET() {
  const debts = await prisma.debt.findMany({
      include: {
        client: true
      }
    })

  return NextResponse.json(debts)
}
