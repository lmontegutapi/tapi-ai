import { Receivable, Contact } from "@prisma/client"

export type ReceivableWithContact = Receivable & {
  contact: Contact
}