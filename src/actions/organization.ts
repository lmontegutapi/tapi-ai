'use server'

import { prisma } from '@/lib/db'
import { session } from '@/lib/auth-server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

interface CreateOrganizationProps {
  name: string;
  slug?: string;
  userId: string;
  role?: string;
  logo?: string;
  metadata?: Record<string, any>;
}

function transformNameToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export async function createOrganization({
  name,
  slug,
  userId,
  role,
  logo,
  metadata,
}: CreateOrganizationProps) {
  try {
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    if(!slug) {
      slug = transformNameToSlug(name)
    }

    const sessionLocal = await session()

    // Crear organización usando el plugin de better-auth
    const organization = await auth.api.createOrganization({
      body: {
        name: name,
        slug: slug,
        userId: userId,
        logo: logo || undefined,
        metadata: metadata || undefined,
        role: role || undefined
      },
      headers: headers()
    })

    if (!organization) {
      return {
        success: false,
        error: 'Error al crear la organización'
      }
    }

    await setActiveOrganization(organization.id)

    return {
      success: true,
      data: organization
    }
  } catch (error) {
    console.error('Error creando organización:', error)
    return {
      success: false,
      error: 'Error al crear la organización. Por favor intenta nuevamente.'
    }
  }
}

export async function getOrganization(slug: string) {
  const data = await session()

  if(!data) {
    return {
      success: false,
      error: 'No se pudo obtener la sesión'
    }
  }

  const organizationId = data.session.activeOrganizationId

  const organization = await auth.api.getFullOrganization({
    query: {
      organizationSlug: slug
    },
    headers: headers()
  })

  if(!organization) {
    return {
      success: false,
      error: 'Organización no encontrada'
    }
  }

  return organization
}

export async function setActiveOrganization(organizationId: string): Promise<any> {
  return await auth.api.setActiveOrganization({
    body: {
      organizationId: organizationId
    }
  })
}

export async function getOrganizationByUserId(userId: string) {
  const data = await session()

  if(!data) {
    return null
  }

  const organization = await auth.api.getFullOrganization({
    query: {
      organizationId: data?.session?.activeOrganizationId || undefined
    },
    headers: headers()
  })

  if(!organization) {
    return null
  }

  return organization
}
interface CreateOrganizationWithOwnerProps {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}