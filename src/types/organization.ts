import { JsonValue } from "@prisma/client/runtime/library"

export interface OrganizationSettings {
  name: string
  id: string
  metadata: JsonValue
  createdAt: Date
  updatedAt: Date
  slug: string | null
  logo: string | null
  settings: {
    payments: {
      CASH: boolean
      BANK_TRANSFER: boolean
      DIGITAL_WALLET: boolean
      CARD: boolean
    }
    communication: {
      whatsapp: { enabled: boolean }
      voiceAI: { enabled: boolean }
      email: { enabled: boolean }
    }
  }
} 