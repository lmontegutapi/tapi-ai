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

/* export async function getOrganizationByUserId(userId: string) {
  const data = await session()

  if(!data) {
    return null
  }

  const organization = await auth.api.getFullOrganization({
    query: {
      organizationId: data?.session?.activeOrganizationId
    },
    headers: headers()
  })

  if(!organization) {
    return null
  }

  return organization
} */

interface CreateOrganizationWithOwnerProps {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export async function createOrganizationWithOwner({
  name,
  slug,
  ownerName,
  ownerEmail,
  ownerPassword,
}: CreateOrganizationWithOwnerProps) {
  try {
    // 1. Crear el usuario owner
    const owner = await auth.api.createUser({
      body: {
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        role: 'OWNER',
      },
      headers: headers()
    })

    if (!owner) {
      return {
        success: false,
        error: 'Error al crear el usuario administrador'
      }
    }


    const org = await auth.api.createOrganization({
      body: {
        name,
        slug,
        userId: owner.user.id,
        role: 'OWNER'
      },
      headers: headers()
    })

    if (!org && owner) {
      // Rollback: eliminar usuario si falla la creación de la organización
      await auth.api.deleteUser()
      return org
    }

    // 3. Enviar invitación por email
/*     await auth.api.inviteUser({
      body: {
        email: ownerEmail,
        organizationId: organization.data.id,
        role: 'OWNER'
      },
      headers: headers()
    }) */

    return {
      success: true,
      data: {
        organization: org,
        owner
      }
    }

  } catch (error) {
    console.error('Error en createOrganizationWithOwner:', error)
    return {
      success: false,
      error: 'Error al crear la organización y el usuario. Por favor intenta nuevamente.'
    }
  }
}