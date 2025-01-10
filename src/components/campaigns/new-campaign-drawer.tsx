"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bot, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { createCampaign } from "@/actions/campaigns";
import { ReceivableWithContact } from "@/types/receivables";
import { ReceivablesSelect } from "../receivables/receivables-select";

const campaignSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  context: z.string().min(10, "El contexto debe tener al menos 10 caracteres"),
  objective: z
    .string()
    .min(10, "El objetivo debe tener al menos 10 caracteres"),
  welcomeMessage: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
  callsPerUser: z.coerce.number().min(1).max(10),
  voiceType: z.enum(["NEUTRAL", "FRIENDLY", "PROFESSIONAL"]).default("NEUTRAL"),
  agentId: z.string().min(1, "Debes seleccionar un agente"),
  receivableIds: z.array(z.string()).optional(),
});

interface Agent {
  id: string;
  name: string;
  voiceId: string;
  voiceType: string;
}

interface NewCampaignDrawerProps {
  agents?: Agent[] | undefined;
  receivables?: ReceivableWithContact[] | undefined;
}

type CampaignFormValues = z.infer<typeof campaignSchema>;

export function NewCampaignDrawer({
  agents,
  receivables,
}: NewCampaignDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      context: "",
      objective: "",
      welcomeMessage: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "18:00",
      callsPerUser: 3,
      voiceType: "NEUTRAL",
      agentId: "", // Valor por defecto para agentId
      receivableIds: [],
    },
  });

  async function onSubmit(data: CampaignFormValues) {
    try {
      const selectedAgent = agents.find(agent => agent.id === data.agentId);
      if (!selectedAgent) throw new Error("Agente no encontrado");

      const result = await createCampaign({
        ...data,
        voiceId: selectedAgent.voiceId,
        voiceName: selectedAgent.name,
        receivableIds: [],
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Campaña creada",
        description: "La campaña se ha creado correctamente",
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la campaña",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Nueva Campaña</Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </SheetTitle>
          <SheetDescription>
            Crea una nueva campaña de llamadas automáticas
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-6"
          >
            <ScrollArea className="h-[calc(100vh-200px)]">
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

              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha inicio</FormLabel>
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
                        <FormLabel>Fecha fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora inicio</FormLabel>
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
                        <FormLabel>Hora fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contexto de la empresa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el contexto de tu empresa..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
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
                        className="resize-none"
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
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivableIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deudas a cobrar</FormLabel>
                    <FormControl>
                      <ReceivablesSelect
                        receivables={receivables}
                        selectedIds={field.value}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona las deudas que se incluirán en esta campaña
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="callsPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Llamadas por contacto</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={10} {...field} />
                      </FormControl>
                      <FormDescription>Máximo 10 intentos</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agente AI</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un agente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                <div className="flex items-center gap-2">
                                  <Bot className="h-4 w-4" />
                                  <div className="flex flex-col">
                                    <span>{agent.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Voz: {agent.voiceType}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Selecciona el agente que realizará las llamadas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-between gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
                className="w-full"
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
                  "Crear campaña"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
