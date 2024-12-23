// components/forms/campaign/edit-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Campaign } from "@prisma/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCampaign } from "@/actions/campaigns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const campaignFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  organizationId: z.string().uuid("ID de organización inválido"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de inicio inválida",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de fin inválida",
  }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  callsPerUser: z.number().min(1).max(10),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]),
  context: z.string().min(10, "El contexto debe tener al menos 10 caracteres"),
  objective: z
    .string()
    .min(10, "El objetivo debe tener al menos 10 caracteres"),
  welcomeMessage: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres"),
  voiceId: z.string().optional(),
  voiceName: z.string().optional(),
  voicePreviewUrl: z.string().url().optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface EditCampaignFormProps {
  campaign: Campaign;
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const router = useRouter();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: campaign.name,
      organizationId: campaign.organizationId,
      startDate: campaign.startDate.toISOString().split("T")[0],
      endDate: campaign.endDate.toISOString().split("T")[0],
      startTime: campaign.startTime,
      endTime: campaign.endTime,
      callsPerUser: campaign.callsPerUser,
      status: campaign.status,
      context: campaign.context,
      objective: campaign.objective,
      welcomeMessage: campaign.welcomeMessage,
      voiceId: campaign.voiceId || undefined,
      voiceName: campaign.voiceName || undefined,
      voicePreviewUrl: campaign.voicePreviewUrl || undefined,
    },
  });

  async function onSubmit(data: CampaignFormValues) {
    try {
      const result = await updateCampaign(campaign.id, data);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Campaña actualizada",
        description: "Los cambios se guardaron correctamente.",
      });

      router.push("/dashboard/campaigns");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la campaña. Intenta nuevamente.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la campaña</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Cobranza mensual Diciembre"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de fin</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contexto de la empresa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el contexto de tu empresa..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Esta información ayudará al agente a entender mejor el
                      contexto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo de las llamadas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="¿Qué buscas lograr con estas llamadas?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="welcomeMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje de bienvenida</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mensaje inicial que dirá el agente..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="callsPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Llamadas por contacto</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={10} {...field} />
                    </FormControl>
                    <FormDescription>
                      Número máximo de intentos por contacto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={form.formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
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
  );
}
