"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Debt } from "@prisma/client"
import { MoreHorizontal, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Client } from "@prisma/client"

type DebtWithClient = Debt & {  
  client: Client
}

export const columns: ColumnDef<DebtWithClient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "client",
    header: "Cliente",
    cell: ({ row }) => {
      const debt = row.original
      return (
        <div>
          <div className="font-medium">{debt.client.name}</div>
          <div className="text-sm text-muted-foreground">{debt.client.phone}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "amountInCents",
    header: "Monto",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amountInCents")) / 100
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold
          ${status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
          status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 
          'bg-green-100 text-green-800'}`}>
          {status}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const debt = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.location.href = `tel:${debt.client.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Llamar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Marcar como pagado</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Marcar vencido</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 