"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Phone, DollarSign, Trash2, Pencil } from "lucide-react"
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
import { initiateCall, registerPayment, markAsOverdue, deleteReceivable } from "@/actions/receivables"
import { EditReceivableDrawer } from "./edit-receivable-drawer"

interface ActionCellProps {
  receivable: ReceivableWithContact
}

export function ActionCell({ receivable }: ActionCellProps) {
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const router = useRouter()

  const handleCall = async () => {
    try {
      if (!receivable.contact.phone) {
        throw new Error("El contacto no tiene número de teléfono");
      }

      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL no configurada");
      }

      const result = await initiateCall(receivable.id, undefined, true);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Llamada iniciada",
        description: `Llamando a ${receivable.contact.phone}...`
      });

      setShowCallDialog(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo iniciar la llamada"
      });
    }
  };

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

  async function handleDeleteReceivable() {
    try {
      const result = await deleteReceivable(receivable.id)
      if (!result.success) {
        throw new Error(result.error)
      }
      
      toast({
        title: "Deuda eliminada",
        description: "La deuda se ha eliminado correctamente"
      })
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la deuda"
      })
    }
  }

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
          <DropdownMenuItem onClick={handleCall}>
            <Phone className="mr-2 h-4 w-4" />
            Llamar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRegisterPayment}>
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar pago
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDrawer(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDeleteReceivable} 
            className="text-destructive"
            disabled={receivable.campaign?.status === "ACTIVE"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleMarkAsOverdue} className="text-red-600">
            Marcar como vencida
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditReceivableDrawer 
        receivable={receivable}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
      />
    </>
  )
} 