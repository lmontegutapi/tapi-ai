"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Phone, DollarSign } from "lucide-react"
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
import { ReceivableWithContact } from "@/types/receivables"
import { formatCurrency, formatDate } from "@/lib/utils"

export const columns: ColumnDef<ReceivableWithContact>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "contact",
    header: "Cliente",
    cell: ({ row }) => {
      const receivable = row.original
      return (
        <div>
          <div className="font-medium">{receivable.contact.name}</div>
          <div className="text-sm text-muted-foreground">
            {receivable.contact.phone}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("dueDate"))}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold 
          ${
            status === "OPEN"
              ? "bg-blue-100 text-blue-800"
              : status === "OVERDUE"
              ? "bg-red-100 text-red-800"
              : status === "CLOSED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "OPEN"
            ? "Pendiente"
            : status === "OVERDUE"
            ? "Vencido"
            : status === "CLOSED"
            ? "Cerrado"
            : "Otro"}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const receivable = row.original
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
            <DropdownMenuItem
              onClick={() => handleCall(receivable)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Llamar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar pago
            </DropdownMenuItem>
            <DropdownMenuItem>Ver historial</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Marcar vencido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const handleCall = async (receivable: ReceivableWithContact) => {
  // Implementar la lógica de llamada
}

const handleRegisterPayment = async (receivable: ReceivableWithContact) => {
  // Implementar la lógica de registro de pago
}

const handleMarkAsOverdue = async (receivable: ReceivableWithContact) => {
  // Implementar la lógica de marcado como vencido
}
