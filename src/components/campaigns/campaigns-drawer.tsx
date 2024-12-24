"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Campaign } from "@prisma/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CampaignForm } from "./campaigns-form"
import { createCampaign, updateCampaign } from "@/actions/campaigns"
import { ReceivableWithContact } from "@/types/receivables"

interface CampaignDrawerProps {
  campaign?: Campaign
  receivables: ReceivableWithContact[] | any
  trigger?: React.ReactNode
}

export function CampaignDrawer({ campaign, receivables, trigger }: CampaignDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(data: any) {
    setIsSubmitting(true)
    try {
      const action = campaign ? updateCampaign : createCampaign
      const result = campaign 
        ? await updateCampaign(campaign.id, data)
        : await createCampaign(data)

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
            Nueva Campaña
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="max-w-max min-w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {campaign ? "Editar Campaña" : "Nueva Campaña"}
          </SheetTitle>
        </SheetHeader>
        <CampaignForm 
          campaign={campaign}
          receivables={receivables}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </SheetContent>
    </Sheet>
  )
}