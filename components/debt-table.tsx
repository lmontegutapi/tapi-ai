'use client'

import { Debt } from '@prisma/client'
import { columns } from './debts/columns'
import { DataTable } from './debts/data-table'

const DebtTable = ({ debts }: { debts: Debt[] }) => {
  return <DataTable columns={columns} data={debts} />
}

export default DebtTable