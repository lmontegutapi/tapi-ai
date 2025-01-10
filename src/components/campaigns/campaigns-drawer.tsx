"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Campaign } from "@prisma/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { createCampaign, updateCampaign } from "@/actions/campaigns"
import { Audience } from "@prisma/client"
import { CampaignForm } from "./campaigns-form"

interface CampaignsDrawerProps {
  campaign?: Campaign;
  agents?: any[];
  audiences?: Audience[];
  trigger?: React.ReactNode;
}

export function CampaignsDrawer({ 
  campaign, 
  agents, 
  audiences,
  trigger 
}: CampaignsDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: any) {
    setIsSubmitting(true)
    try {
      const action = campaign ? updateCampaign : createCampaign
      const result = await action(data)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: campaign ? "Campaña actualizada" : "Campaña creada",
        description: campaign ? "Los cambios se han guardado" : "La campaña se ha creado correctamente"
      })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la campaña"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {campaign ? "Editar Campaña" : "Nueva Campaña"}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[1000px] sm:w-[800px] overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle>
            {campaign ? "Editar Campaña" : "Nueva Campaña"}
          </SheetTitle>
          <SheetDescription>
            {campaign 
              ? "Modifica los detalles de la campaña existente" 
              : "Configura una nueva campaña de llamadas automáticas"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <CampaignForm
            campaign={campaign}
            agents={agents}
            audiences={audiences}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}