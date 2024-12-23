import { Receivable, Contact, Campaign } from "@prisma/client"

export type ReceivableWithContact = Receivable & {
  contact: Contact
  campaign: Campaign
}

interface ReceivableMetadata {
  lastUpdatedAt?: Date
  lastUpdatedBy?: string
  lastStatus?: string
  statusChangedAt?: Date
  notes?: string
  paymentAttempts?: number
  callAttempts?: number
  [key: string]: any // Para metadata adicional flexible
}