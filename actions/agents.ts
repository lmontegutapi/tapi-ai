'use server'

import { prisma } from '@/lib/db'
import { session as serverSession } from '@/lib/auth-server'
import { Agent, Prisma } from '@prisma/client'

type CreateAgentInput = {
  name: string;
  description: string;
  elevenlabsId: string;
  voiceType: "male" | "female";
}

type UpdateAgentInput = {
  name?: string;
  description?: string;
  elevenlabsId?: string;
  voiceType?: "male" | "female";
}

export async function getAgents() {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }
  console.log("SESSION", session)
  const organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    }
  })

  console.log("ORGANIZATION", organization)

  return await prisma.agent?.findMany({
    where: {
      organizationId: organization?.id,
      isActive: true
    },
    orderBy: {
      name: 'asc'
    }
  })

}

export async function createAgent(data: CreateAgentInput) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  const organization = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    }
  })

  if (!organization) {
    throw new Error("No se encontró la organización")
  }

  const newAgent = await prisma.agent.create({
    data: {
      ...data,
      organizationId: organization.id,
      isActive: true,
      metadata: Prisma.JsonNull
    }
  })

  return newAgent
}

export async function updateAgent(id: string, data: UpdateAgentInput) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  return await prisma.agent.update({
    where: { id },
    data: {
      ...data,
      metadata: Prisma.JsonNull
    }
  });
}

export async function deleteAgent(agentId: string) {
  const session = await serverSession()
  if (!session) {
    throw new Error("No autorizado")
  }

  const deletedAgent = await prisma.agent.delete({
    where: { id: agentId }
  })

  return deletedAgent
}