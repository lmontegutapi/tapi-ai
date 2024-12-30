"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAudiencesStore } from "@/stores/audiences.store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Audience } from "@prisma/client";
import { updateAudience } from "@/actions/audiences";

const audienceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  delinquencyBucket: z.enum([
    "CURRENT",
    "PAST_DUE_10",
    "PAST_DUE_15",
    "PAST_DUE_30",
    "PAST_DUE_60",
    "PAST_DUE_90",
    "PAST_DUE_OVER_90"
  ]),
  contactPreference: z.enum(["WHATSAPP", "VOICE_AI", "EMAIL"])
});

interface EditAudienceDrawerProps {
  audience: Audience;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAudienceDrawer({ audience, open, onOpenChange }: EditAudienceDrawerProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof audienceSchema>>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      name: audience.name,
      description: audience.description || "",
      delinquencyBucket: audience.delinquencyBucket,
      contactPreference: audience.contactPreference
    }
  });

  async function onSubmit(data: z.infer<typeof audienceSchema>) {
    try {
      const result = await updateAudience(audience.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Audiencia actualizada",
        description: "Los cambios se han guardado correctamente"
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar"
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Editar Audiencia</SheetTitle>
          <SheetDescription>
            Modifica los criterios de segmentación
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <ScrollArea className="max-h-max">
              <div className="space-y-4">
                {/* Same form fields as NewAudienceDrawer */}
                {/* ... */}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 flex-col">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}