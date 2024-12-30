import { prisma } from "@/lib/db";
import { PhoneType } from "@prisma/client";
import { session as serverSession } from "@/lib/auth-server";
export async function getContacts() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        contactPhone: true,
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
        include: { contactPhone: true }
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
          contactPhone: {
            create: [
              {
                phone: data.phone,
                type: "MAIN",
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
        include: { contactPhone: true }
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