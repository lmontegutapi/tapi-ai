import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidWebhook(body)) {
      return NextResponse.json({ error: 'WebHook inválido' }, { status: 401 });
    }

    const { phoneNumber, action, receivableId, amountCents, promisedDate, discountCents } = body;

    // Buscar al usuario basado en su número de teléfono
    const user = await prisma.contact.findFirst({
      where: { phone: phoneNumber },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    switch (action) {
      case 'checkDebt': {
        // Obtener las deudas activas del usuario
        const receivables = await prisma.receivable.findMany({
          where: {
            contactId: user.id,
            isOpen: true,
          },
          orderBy: {
            dueDate: 'asc',
          },
          select: {
            id: true,
            amountCents: true,
            dueDate: true,
            status: true,
          },
        });

        if (receivables.length === 0) {
          return NextResponse.json({ message: 'No tienes deudas activas.' });
        }

        return NextResponse.json({
          message: `Tienes ${receivables.length} deudas activas.`,
          receivables,
        });
      }

      case 'getPaymentOptions': {
        // Obtener métodos de pago disponibles
        const paymentMethods = await prisma.paymentMethod.findMany({
          where: {
            isActive: true,
            organizationId: user.organizationId,
          },
          select: {
            id: true,
            name: true,
            type: true,
          },
        });

        return NextResponse.json({
          message: 'Estos son los métodos de pago disponibles:',
          paymentMethods,
        });
      }

      case 'generatePaymentPromise': {
        // Validar que el receivable exista y pertenezca al usuario
        const receivable = await prisma.receivable.findUnique({
          where: { id: receivableId },
          include: { contact: true },
        });

        const call = await prisma.call.findFirst({
          where: {
            receivableId: receivableId,
          }
        });

        if (!receivable || receivable.contactId !== user.id || !receivable.isOpen) {
          return NextResponse.json({ error: 'La deuda no es válida o ya está cerrada' }, { status: 400 });
        }

        // Calcular el nuevo monto (descuento aplicado)
        const negotiatedAmountCents = receivable.amountCents - (discountCents || 0);
        if (negotiatedAmountCents <= 0) {
          return NextResponse.json({ error: 'El monto negociado no puede ser menor o igual a cero' }, { status: 400 });
        }

        if(receivable.campaignId) {
          // Crear la promesa de pago
          const createData = {
            receivableId: receivable.id,
            campaignId: receivable.campaignId,
            amountCents: negotiatedAmountCents,
            promisedDate: new Date(promisedDate),
            status: 'PENDING' as const,
            metadata: {
              discountCents: discountCents || 0,
              originalAmountCents: receivable.amountCents,
            },
            ...(call?.id && { callId: call.id })
          };

          const paymentPromise = await prisma.paymentPromise.create({ data: createData as any });

          return NextResponse.json({
            message: 'Promesa de pago registrada exitosamente',
            paymentPromise,
          });
        }
      }

      default: {
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function isValidWebhook(body: any): boolean {
  // Implementa la validación del webhook según tus necesidades (e.g., tokens o claves compartidas)
  return true;
}
