'use client'

import { Debt } from '@prisma/client'
import { columns } from './debts/columns'
import { DataTable } from './debts/data-table'
import { DebtWithClient } from '../utils/debtProcessor'

const DebtTable = ({ debts }: { debts: DebtWithClient[] }) => {
  return <DataTable columns={columns} data={debts} />
}

export default DebtTable