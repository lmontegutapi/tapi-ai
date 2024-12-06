import type { Debt, Client } from "@prisma/client"

export type DebtWithClient = Debt & {
  client: Client
}

export const processDebtRecord = (debt: DebtWithClient) => {
  return `
    Buenos días ${debt.client.name},
    Le llamamos respecto a su deuda pendiente por $${Math.round(debt.amountInCents / 100)}.
  `.trim()
}
