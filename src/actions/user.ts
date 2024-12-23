"use server";

import { prisma } from "@/lib/db";
import { session } from "@/lib/auth-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/constants/roles";
import { User } from "@prisma/client";


export async function updateUser(userId: string, data: Partial<User>) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export const getUserRole = async (userId: string) => {
  const user = await getUser(userId);
  return user?.role;
}