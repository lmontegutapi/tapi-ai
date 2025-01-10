"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { createAudience } from "@/actions/audiences";
import { useActiveOrganization } from "@/lib/auth-client";
import { useEffect } from "react";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { ContactChannel, DelinquencyBucket } from "@prisma/client";

const audienceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  delinquencyBucket: z.enum([
    "CURRENT",
    "PAST_DUE_10",
    "PAST_DUE_30",
    "PAST_DUE_60",
    "PAST_DUE_90",
    "PAST_DUE_OVER_90"
  ]),
  contactPreference: z.enum(["WHATSAPP", "VOICE_AI", "EMAIL"])
});

interface NewAudienceDrawerProps {  
  classNameButton?: string;
  variantButton?: "outline" | "default";
}

export function NewAudienceDrawer({ classNameButton, variantButton }: NewAudienceDrawerProps) {
  const { openNewAudienceDrawer, setOpenNewAudienceDrawer } = useAudiencesStore();
  const router = useRouter();
  const activeOrganization = useActiveOrganization();

  const { data: orgSettings } = useOrganizationSettings();
  // Obtener canales habilitados
  const availableChannels: { value: string; label: string }[] = [];
  if (orgSettings?.settings?.communication?.whatsapp?.enabled) {
    availableChannels.push({ value: "WHATSAPP", label: "WhatsApp" });
  }
  if (orgSettings?.settings?.communication?.voiceAI?.enabled) {
    availableChannels.push({ value: "VOICE_AI", label: "Llamada" });
  }
  if (orgSettings?.settings?.communication?.email?.enabled) {
    availableChannels.push({ value: "EMAIL", label: "Email" });
  }
  
  const form = useForm<z.infer<typeof audienceSchema>>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      delinquencyBucket: DelinquencyBucket.CURRENT,
      contactPreference: ContactChannel.WHATSAPP
    }
  });

  useEffect(() => {
    form.reset();
  }, []);

  async function onSubmit(data: z.infer<typeof audienceSchema>) {
    try {
      if (!activeOrganization?.data) {
        throw new Error("No se pudo obtener la organización activa");
      }

      console.log("data", data);

      const dataWithOrganizationId = {
        ...data,
        organizationId: activeOrganization.data.id
      }

      const result = await createAudience(dataWithOrganizationId);

      console.log("result", result);

      if (!result.data) {
        throw new Error(result.error || "Error al crear la audiencia");
      }

      toast({
        title: "Audiencia creada",
        description: "La audiencia se ha creado correctamente"
      });

      setOpenNewAudienceDrawer(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la audiencia"
      });
    }
  }

  return (
    <Sheet open={openNewAudienceDrawer} onOpenChange={setOpenNewAudienceDrawer}>
      <SheetTrigger asChild>
        <Button variant={variantButton} className={classNameButton}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Audiencia
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Crear Nueva Audiencia</SheetTitle>
          <SheetDescription>
            Define los criterios para segmentar tu audiencia
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <ScrollArea className="max-h-max">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Deudores 30 días" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Descripción opcional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delinquencyBucket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Morosidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar morosidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CURRENT">Al día</SelectItem>
                          <SelectItem value="PAST_DUE_30">30 días</SelectItem>
                          <SelectItem value="PAST_DUE_60">60 días</SelectItem>
                          <SelectItem value="PAST_DUE_90">90 días</SelectItem>
                          <SelectItem value="PAST_DUE_OVER_90">Más de 90 días</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

          <FormField
                  control={form.control}
                  name="contactPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de Contacto</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={availableChannels.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              availableChannels.length === 0 
                                ? "No hay canales habilitados" 
                                : "Seleccionar canal"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableChannels.map(channel => (
                            <SelectItem key={channel.value} value={channel.value}>
                              {channel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableChannels.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Habilita los canales de comunicación en la configuración
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 flex-col">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setOpenNewAudienceDrawer(false)}
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
                    Creando...
                  </>
                ) : (
                  "Crear audiencia"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}