import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization, admin } from "better-auth/plugins"
import { organizationClient } from "better-auth/client/plugins"
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins"
import { headers } from "next/headers"

const prisma = new PrismaClient();

// Función auxiliar para obtener la organización activa
async function getActiveOrganization(userId: string) {
  // Buscar la primera organización donde el usuario es miembro usando el modelo Member
  const userMembership = await prisma.member.findFirst({
    where: {
      userId: userId,
    },
    include: {
      organization: true
    }
  });

  // Si no existe una organización, lanzar error
  if (!userMembership) {
    throw new Error("No organization found for user");
  }

  return userMembership.organization;
}

export const auth = betterAuth({
    rateLimit: {
      storage: "database",
      modelName: "rate_limit", //optional by default "rateLimit" is used
    },
    emailAndPassword: {  
      enabled: true
    },
    database: prismaAdapter(prisma, {
      provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [organization(), admin(), organizationClient(), nextCookies(), openAPI()],
    databaseHooks: {
      session: {
        create: {
          before: async(session) => {
            try {
              const organization = await getActiveOrganization(session.userId);
              return {
                data: {
                  ...session,
                  activeOrganizationId: organization.id
                }
              };
            } catch (error) {
              console.error("Error setting active organization:", error);
              // Si hay error, continuamos sin organización activa
              return { data: session };
            }
          }
        }
      }
    }
});