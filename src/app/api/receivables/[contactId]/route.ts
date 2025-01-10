import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params;

    const result = await prisma.receivable.findMany({
      where: {
        contactId,
        isOpen: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        contact: {
          include: {
            organization: true,
          },
        },
      },
    });

    return NextResponse.json({
      receivables: result,
      contact: result[0]?.contact ?? null,
      paymentMethods: result[0]?.contact?.organization?.settings?.payments ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener las deudas" },
      { status: 500 }
    );
  }
}