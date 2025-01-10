import { prisma } from "@/lib/db";
import { Contact, ContactPhone, PhoneType } from "@prisma/client";
import { session as serverSession } from "@/lib/auth-server";

export async function getContacts(): Promise<(Contact & { phones: ContactPhone[] })[]> {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        phones: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return contacts;
  } catch (error) {
    console.error("Error al obtener contactos:", error);
    throw new Error("No se pudieron cargar los contactos");
  }
}


export async function updateContact(id: string, data: {
  name: string;
  identifier: string;
  email?: string;
  phone: string;
  rfc?: string;
  address?: string;
  additionalPhones?: string;
 }) {
  try {
    const session = await serverSession();
    if (!session?.session?.activeOrganizationId) {
      return { success: false, error: "No autorizado" };
    }
 
    const contact = await prisma.$transaction(async (tx) => {
      const existingContact = await tx.contact.findUnique({
        where: { id },
        include: { phones: true }
      });
 
      if (!existingContact) {
        throw new Error("Contacto no encontrado");
      }
 
      // Actualizar teléfonos
      await tx.contactPhone.deleteMany({
        where: { contactId: id }
      });
 
      return await tx.contact.update({
        where: { id },
        data: {
          name: data.name,
          identifier: data.identifier,
          email: data.email || null,
          phone: data.phone,
          rfc: data.rfc || null,
          address: data.address || null,
          phones: {
            create: [
              {
                phone: data.phone,
                type: PhoneType.MAIN,
                isPrimary: true,
                updatedAt: new Date()
              },
              ...(data.additionalPhones?.split(',').map(phone => ({
                phone: phone.trim(),
                type: PhoneType.OTHER,
                isPrimary: false,
                updatedAt: new Date()
              })) ?? [])
            ]
          }
        },
        include: { phones: true }
      });
    });
 
    return { success: true, data: contact };
  } catch (error) {
    console.error("Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando contacto" 
    };
  }
 }

 export async function getContactDetails(contactId: string) {
  try {
    const session = await serverSession();
    if (!session) return null;

    const contact = await prisma.contact.findUnique({
      where: { 
        id: contactId,
        organizationId: session?.session?.activeOrganizationId || ''
      },
      include: {
        receivables: {
          include: {
            invoices: true,
            paymentPromises: true
          },
          orderBy: {
            dueDate: 'desc'
          },
          take: 7
        },
        phones: true
      }
    });

    if (!contact) return null;

    // Calcular métricas de pago
    const totalReceivables = contact.receivables.length;
    const paidReceivables = contact.receivables.filter(r => 
      r.status === 'CLOSED' || r.status === 'PARTIALLY_PAID'
    ).length;
    const paymentRatio = totalReceivables > 0 
      ? (paidReceivables / totalReceivables) * 100 
      : 0;

    // Categorización de pagador
    let payerCategory = 'Sin historial';
    if (paymentRatio === 100) payerCategory = 'Excelente';
    else if (paymentRatio >= 80) payerCategory = 'Bueno';
    else if (paymentRatio >= 50) payerCategory = 'Regular';
    else payerCategory = 'Malo';

    return {
      ...contact,
      paymentMetrics: {
        totalReceivables,
        paidReceivables,
        paymentRatio,
        payerCategory
      }
    };
  } catch (error) {
    console.error('Error fetching contact details:', error);
    return null;
  }
}

export async function getContactReceivablesPaginated(
  contactId: string, 
  page: number = 1, 
  pageSize: number = 10
) {
  try {
    const session = await serverSession();
    if (!session) return null;

    const skip = (page - 1) * pageSize;

    const receivables = await prisma.receivable.findMany({
      where: { 
        contactId,
        organizationId: session?.session?.activeOrganizationId || ''
      },
      include: {
        invoices: true,
        paymentPromises: true
      },
      orderBy: {
        dueDate: 'desc'
      },
      skip,
      take: pageSize
    });

    const total = await prisma.receivable.count({
      where: { 
        contactId,
        organizationId: session?.session?.activeOrganizationId || ''
      }
    });

    return {
      receivables,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching paginated receivables:', error);
    return null;
  }
}