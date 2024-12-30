import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar si el WebHook es válido (por ejemplo, verificar el token)
    if (!isValidWebhook(body)) {
      return NextResponse.json({ error: 'WebHook inválido' }, { status: 401 });
    }

    // Procesar los datos del WebHook
    await processWebhookData(body);

    return NextResponse.json({ message: 'WebHook procesado correctamente' });
  } catch (error) {
    console.error('Error procesando WebHook de ElevenLabs:', error);
    return NextResponse.json({ error: 'Error al procesar WebHook' }, { status: 500 });
  }
}

async function isValidWebhook(body: any): Promise<boolean> {
  // Aquí debes implementar la lógica para verificar la validez del WebHook
  // (por ejemplo, verificar un token de autenticación)
  return true;
}

async function processWebhookData(body: any): Promise<void> {
  // Procesar los datos del WebHook y actualizarlos en la base de datos
  const { receivableId, promisedAmount, promisedDate, callId } = body;

  // Buscar la deuda (receivable) en la base de datos
  const receivable = await prisma.receivable.findUnique({
    where: { id: receivableId },
    include: {
      paymentPromise: true,
    },
  });

  if (!receivable) {
    throw new Error(`Deuda (receivable) no encontrada: ${receivableId}`);
  }

  // Crear o actualizar la promesa de pago
  const baseData = {
    receivableId: receivable.id,
    amountCents: promisedAmount,
    promisedDate: new Date(promisedDate),
    status: 'PENDING' as const,
    callId,
  };

  const paymentPromise = receivable.paymentPromise
    ? await prisma.paymentPromise.update({
        where: { id: receivable.paymentPromise[0].id },
        data: {
          amountCents: promisedAmount,
          promisedDate: new Date(promisedDate),
          status: 'PENDING',
        },
      })
    : await prisma.paymentPromise.create({
        data: {
          ...baseData,
          campaignId: receivable.campaignId || 'default'
        }
      });

  // Actualizar el estado de la deuda (receivable)
  await prisma.receivable.update({
    where: { id: receivable.id },
    data: {
      status: 'PENDING_DUE',
    },
  });
}