export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  AGENT = "AGENT",
}

// Metadatos útiles para la UI
export const roleMetadata = {
  [UserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    variant: "destructive",
    description: "Puede gestionar todo el sistema",
  },
  [UserRole.OWNER]: {
    label: "Dueño",
    variant: "default",
    description: "Dueño de una organización",
  },
  [UserRole.ADMIN]: {
    label: "Administrador",
    variant: "secondary",
    description: "Administrador de una organización",
  },
  [UserRole.MANAGER]: {
    label: "Gerente",
    variant: "outline",
    description: "Puede gestionar campañas y deudas",
  },
  [UserRole.AGENT]: {
    label: "Agente",
    variant: "ghost",
    description: "Solo puede hacer llamadas y gestionar deudas",
  },
} as const; 