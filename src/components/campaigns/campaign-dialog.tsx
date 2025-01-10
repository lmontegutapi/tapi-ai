"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CampaignForm } from "./campaign-form";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CampaignDialogProps {
  campaign?: any;
  audiences?: any[];
  trigger?: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
}

export function CampaignDialog({ campaign, audiences, trigger, onSubmit }: CampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "Éxito",
        description: campaign 
          ? "La campaña se actualizó correctamente" 
          : "La campaña se creó correctamente",
      });
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo procesar la campaña",
      });
    } finally {
      setIsSubmitting(false);
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
          audiences={audiences}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}