"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Phone, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { ReceivableWithContact } from "@/types/receivables"
import { initiateCall, registerPayment, markAsOverdue } from "@/actions/receivables"

interface ActionCellProps {
  receivable: ReceivableWithContact
}

export function ActionCell({ receivable }: ActionCellProps) {
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const router = useRouter()

  const handleCall = async () => {
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

  const handleRegisterPayment = async () => {
    try {
      const result = await registerPayment(receivable.id, {
        amountCents: Number(receivable.amountCents),
        paymentDate: new Date(),
        paymentMethod: "CASH"
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

  const handleMarkAsOverdue = async () => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCall}>
          <Phone className="mr-2 h-4 w-4" />
          Llamar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRegisterPayment}>
          <DollarSign className="mr-2 h-4 w-4" />
          Registrar pago
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleMarkAsOverdue} className="text-red-600">
          Marcar como vencida
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 