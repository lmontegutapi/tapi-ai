import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { resend } from "@/lib/email/resend";
import { reactInvitationEmail } from "@/lib/email/invitation-email";
import { reactResetPasswordEmail } from "@/lib/email/reset-password-email";
import { prisma as prismaClient } from "@/lib/db";
import { UserRole } from "./constants/roles";

const prisma = new PrismaClient();

const from = "Cobranzas AI <onboarding@cobranzasai.com>";
const to = "onboarding@cobranzasai.com";
// Función auxiliar para obtener la organización activa
async function getActiveOrganization(userId: string) {
  // Buscar la primera organización donde el usuario es miembro usando el modelo Member
  const userMembership = await prisma.member.findFirst({
    where: {
      userId: userId,
    },
    include: {
      organization: true,
    },
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
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await resend.emails.send({
        from,
        to: to || user.email,
        subject: "Verifica tu correo electrónico",
        html: `<a href="${url}">Verifica tu correo electrónico</a>`,
      });
      console.log("Email sent", res, user.email);
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Restablece tu contraseña",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const res = await resend.emails.send({
          from,
          to: data.email,
          subject: "Te han invitado a unirte a una organización",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${
                    process.env.BETTER_AUTH_URL ||
                    "https://demo.better-auth.com"
                  }/accept-invitation/${data.id}`,
          }),
        });
        console.log(res, data.email);
      },
      allowUserToCreateOrganization: async (user) => {
        const userRole = await prismaClient.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            role: true,
          },
        });

        
        return userRole?.role === UserRole.ADMIN || userRole?.role === UserRole.SUPER_ADMIN;
      },
    }),
    admin(),
    nextCookies(),
    openAPI(),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            const organization = await getActiveOrganization(session.userId);
            return {
              data: {
                ...session,
                activeOrganizationId: organization.id,
              },
            };
          } catch (error) {
            console.error("Error setting active organization:", error);
            // Si hay error, continuamos sin organización activa
            return { data: session };
          }
        },
      },
      update: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return { data: { ...session, activeOrganizationId: organization.id } };
        },
      },
    },
  },
});