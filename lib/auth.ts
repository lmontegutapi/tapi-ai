import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { organization, admin } from "better-auth/plugins"
import { organizationClient } from "better-auth/client/plugins"
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();
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
    plugins: [organization(), admin(), organizationClient(), nextCookies()],
});