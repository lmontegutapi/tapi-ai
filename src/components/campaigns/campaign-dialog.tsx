"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { CampaignForm } from "./campaign-form";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCampaignsStore } from "@/stores/campaigns.store";

interface CampaignDialogProps {
  campaign?: any;
  trigger?: React.ReactNode;
}

export function CampaignDialog({ campaign, trigger }: CampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { createCampaign, isSubmitting } = useCampaignsStore();

  const handleSubmit = async (data: any) => {
    const result = await createCampaign(data);
    
    if (result.success) {
      toast({
        title: "Éxito",
        description: campaign 
          ? "La campaña se actualizó correctamente" 
          : "La campaña se creó correctamente",
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "No se pudo procesar la campaña",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {campaign ? "Editar Campaña" : "Nueva Campaña"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? "Editar Campaña" : "Nueva Campaña"}
          </DialogTitle>
        </DialogHeader>
        <CampaignForm
          campaign={campaign}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}