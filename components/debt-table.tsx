'use client'

import { columns } from './debts/columns'
import { DataTable } from './debts/data-table'
import { DebtWithClient } from '../utils/debtProcessor'

const DebtTable = ({ debts }: { debts: DebtWithClient[] }) => {
  return <DataTable columns={columns} data={debts} />
}

export default DebtTable