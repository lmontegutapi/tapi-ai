import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar si el WebHook es válido (por ejemplo, verificar el token)
    if (!isValidWebhook(body)) {
      return NextResponse.json({ error: 'WebHook inválido' }, { status: 401 });
    }

    const { phoneNumber } = body;

    // Buscar el ID de usuario en base al número de teléfono
    const user = await prisma.contact.findFirst({
      where: {
        phone: phoneNumber,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener las deudas (receivables) del usuario
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

    // Obtener los métodos de pago disponibles
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
        isActive: true,
      },
      select: {
        id: true,
        type: true,
        name: true,
      },
    });

    return NextResponse.json({
      receivables,
      paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error al obtener la información' }, { status: 500 });
  }
}

async function isValidWebhook(body: any): Promise<boolean> {
  // Aquí debes implementar la lógica para verificar la validez del WebHook
  // (por ejemplo, verificar un token de autenticación)
  return true;
}