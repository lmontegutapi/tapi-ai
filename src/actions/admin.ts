"use server";

import { prisma } from "@/lib/db";
import { session } from "@/lib/auth-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/constants/roles";

const createOrganizationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
});

export async function createOrganizationWithAdmin(
  data: z.infer<typeof createOrganizationSchema>
) {
  const auth = await session();
  
  /* if (!auth?.user || auth.user. !== UserRole.SUPER_ADMIN) {
    throw new Error("No autorizado");
  } */

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
  const auth = await session();
  
  /* if (!auth?.user || auth.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error("No autorizado");
  } */

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

export async function getUsers() {
  const auth = await session();
  
/*   if (!auth?.user || auth.user.role !== UserRole.SUPER_ADMIN) {
    throw new Error("No autorizado");
  } */

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