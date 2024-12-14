"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "@/hooks/use-toast";
import { updateAgent } from "@/actions/agents";
import { Agent } from "@prisma/client";
import { Slider } from "@/components/ui/slider";

const agentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  elevenlabsId: z.string().min(1, "Debes proporcionar un ID de ElevenLabs"),
  voiceType: z.enum(["male", "female"]),
  stability: z.number().min(0).max(1).default(0.5),
  similarityBoost: z.number().min(0).max(1).default(0.75),
  style: z.number().min(0).max(1).default(0.5),
  useCase: z.enum(["COLLECTIONS", "CUSTOMER_SERVICE", "SALES"]).default("COLLECTIONS"),
  speakingStyle: z.enum(["PROFESSIONAL", "FRIENDLY", "ASSERTIVE"]).default("PROFESSIONAL"),
});

interface EditAgentDrawerProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAgentDrawer({
  agent,
  open,
  onOpenChange,
}: EditAgentDrawerProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: agent.name,
      description: agent.description || "",
      elevenlabsId: agent.elevenlabsId,
      voiceType: agent.voiceType as "male" | "female",
      stability: agent.metadata?.elevenlabs?.conversation_config?.tts?.stability || 0.5,
      similarityBoost: agent.metadata?.elevenlabs?.conversation_config?.tts?.similarity_boost || 0.75,
      style: agent.metadata?.style || 0.5,
      useCase: agent.metadata?.useCase || "COLLECTIONS",
      speakingStyle: agent.metadata?.speakingStyle || "PROFESSIONAL",
    },
  });

  async function onSubmit(data: z.infer<typeof agentSchema>) {
    try {
      const result = await updateAgent(agent.id, data);

      if (!result) {
        throw new Error("No se pudo actualizar el agente");
      }

      toast({
        title: "Agente actualizado",
        description: "Los cambios se guardaron correctamente",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el agente",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Editar Agente</SheetTitle>
          <SheetDescription>
            Modifica la configuración del agente
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del agente</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="elevenlabsId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de ElevenLabs</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>ID de la voz en ElevenLabs</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voiceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de voz</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculina</SelectItem>
                      <SelectItem value="female">Femenina</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuración de Voz</h3>
              
              <FormField
                control={form.control}
                name="stability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estabilidad de Voz</FormLabel>
                    <FormControl>
                      <Slider 
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        max={1}
                        step={0.1}
                      />
                    </FormControl>
                    <FormDescription>
                      Controla la estabilidad de la voz. Valores más altos = más estable
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="similarityBoost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Similitud de Voz</FormLabel>
                    <FormControl>
                      <Slider 
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        max={1}
                        step={0.1}
                      />
                    </FormControl>
                    <FormDescription>
                      Controla qué tan similar es la voz al original
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caso de Uso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el caso de uso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COLLECTIONS">Cobranza</SelectItem>
                        <SelectItem value="CUSTOMER_SERVICE">Atención al Cliente</SelectItem>
                        <SelectItem value="SALES">Ventas</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speakingStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo de Habla</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estilo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
                        <SelectItem value="FRIENDLY">Amigable</SelectItem>
                        <SelectItem value="ASSERTIVE">Asertivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  );
}
