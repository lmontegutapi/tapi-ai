"use server";

import { prisma } from "@/lib/db";
import { session as sessionServer } from "@/lib/auth-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/constants/roles";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
const createOrganizationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
});

export async function createOrganizationWithAdmin(
  data: z.infer<typeof createOrganizationSchema>
) {
  const session = await sessionServer();    
  
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    throw new Error("No autorizado");
  }

  const validated = createOrganizationSchema.parse(data);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Crear la organización
      const organization = await tx.organization.create({
        data: {
          name: validated.name,
          slug: validated.name.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date(),
        },
      });

      // Crear el usuario owner
      const owner = await tx.user.create({
        data: {
          name: validated.adminName,
          email: validated.adminEmail,
          role: UserRole.OWNER,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Crear la membresía
      await tx.member.create({
        data: {
          organizationId: organization.id,
          userId: owner.id,
          role: UserRole.OWNER,
          createdAt: new Date(),
        },
      });

      /* const activeOrganization = await authClient.api.setActiveOrganization({
        body: {
          organizationId: organization.id,
        },
        headers: headers()
      });

      const invitation = await authClient.api.createInvitation({
        body: {
          email: validated.adminEmail,
          organizationId: organization.id,
          role: "owner",
        },
        headers: headers()
      });*/

      return { organization, owner };
    });

    revalidatePath("/admin");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { success: false, error: "Error al crear la organización" };
  }
}

export async function getOrganizations() {
  const session = await sessionServer();
  
      if (!session?.user || session.user.role !== UserRole.ADMIN) {
        throw new Error("No autorizado");
      }

  const organizations = await prisma.organization.findMany({
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          receivables: true,
          campaigns: true,
        },
      },
    },
  });

  return organizations;
}

export async function deleteOrganization(id: string) {
  await prisma.organization.delete({
    where: {
      id: id,
    },
    include: {
      members: true,
    }
  });

  revalidatePath("/admin/organizations")
}

export async function getUsers() {
  const session = await sessionServer();
  
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    throw new Error("No autorizado");
  }

  const users = await prisma.user.findMany({
    include: {
      members: {
        include: {
          organization: true,
        },
      },
    },
  });

  return users;
}

export async function addMemberWithoutInvitation({ userId, organizationId }: { userId: string | undefined, organizationId: string | undefined }) {
  const session = await sessionServer();

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    throw new Error("No autorizado");
  }

  if(!userId || !organizationId) {
    throw new Error("Error al agregar el miembro");
  }

  const member = await auth.api.addMember({
    body: {
      userId: userId,
      organizationId: organizationId,
      role: "owner",
    },
    headers: headers()
  });

  if(!member) {
    throw new Error("Error al agregar el miembro");
  }

  return member;
}