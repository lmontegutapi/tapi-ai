"use server";

import { prisma } from "@/lib/db";
import { session as sessionServer } from "@/lib/auth-server";

interface Receivable {
  id: string;
  amountCents: number;
  dueDate: Date;
  status: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export async function getClientAndReceivables(contactId: string) {
  const session = await sessionServer();
  if (!session) throw new Error("No autorizado");

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        organization: true,
        receivables: {
          where: { isOpen: true },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!contact) return { client: null, receivables: [] };

    const client: Client = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    };

    const receivables: Receivable[] = contact.receivables.map((r) => ({
      id: r.id,
      amountCents: r.amountCents,
      dueDate: r.dueDate,
      status: r.status,
    }));

    return { client, receivables };
  } catch (error) {
    console.error("Error fetching client and receivables:", error);
    throw error;
  }
}