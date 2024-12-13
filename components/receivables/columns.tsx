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
import { 
  initiateCall, 
  registerPayment, 
  markAsOverdue,
} from "@/actions/receivables"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { CallDialog } from "./call-dialog"
import { EditReceivableDrawer } from "./edit-receivable-drawer"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
      const [showCallDialog, setShowCallDialog] = useState(false)
      const [showEditDrawer, setShowEditDrawer] = useState(false)
      const router = useRouter()
  
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowCallDialog(true)}>
                <Phone className="mr-2 h-4 w-4" />
                Llamar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditDrawer(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRegisterPayment(receivable)}>Registrar pago</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleMarkAsOverdue(receivable)}>
                Marcar vencido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
  
          <CallDialog 
            receivable={receivable}
            open={showCallDialog}
            onOpenChange={setShowCallDialog}
          />
  
          <EditReceivableDrawer
            receivable={receivable}
            open={showEditDrawer}
            onOpenChange={setShowEditDrawer}
            onSuccess={() => {
              // Refrescar datos
              router.refresh()
            }}
          />
        </>
      )
    }
  }
]

const handleCall = async (receivable: ReceivableWithContact) => {
  try {
    const result = await initiateCall(receivable.id)
    if (!result.success) {
      throw new Error(result.error)
    }
    
    toast({
      title: "Llamada iniciada",
      description: "Se ha iniciado la llamada correctamente"
    })
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo iniciar la llamada"
    })
  }
}

const handleRegisterPayment = async (receivable: ReceivableWithContact) => {
  try {
    const result = await registerPayment(receivable.id, {
      amount: Number(receivable.amount),
      paymentDate: new Date(),
      paymentMethod: "CASH" // O mostrar un modal para seleccionar
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    toast({
      title: "Pago registrado",
      description: "El pago se ha registrado correctamente"
    })
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo registrar el pago"
    })
  }
}

const handleMarkAsOverdue = async (receivable: ReceivableWithContact) => {
  try {
    const result = await markAsOverdue(receivable.id)
    if (!result.success) {
      throw new Error(result.error)
    }

    toast({
      title: "Estado actualizado",
      description: "La deuda se ha marcado como vencida"
    })
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo actualizar el estado"
    })
  }
}
