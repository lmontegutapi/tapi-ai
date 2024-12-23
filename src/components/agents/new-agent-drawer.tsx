"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { createAgent } from "@/actions/agents";
import { Slider } from "@/components/ui/slider";
import { VoicePreviewButton } from "@/components/agents/voice-preview-button";
import { useQuery } from "@tanstack/react-query";
import { getVoices, type ElevenLabsVoice } from "@/lib/services/elevenlabs";
import { ScrollArea } from "../ui/scroll-area";

const agentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  voiceId: z.string().min(1, "Debes seleccionar una voz"),
  voiceType: z.enum(["male", "female"]),
  stability: z.number().min(0).max(1).default(0.5),
  similarityBoost: z.number().min(0).max(1).default(0.75),
  style: z.number().min(0).max(1).default(0.5),
  useCase: z.enum(["COLLECTIONS", "CUSTOMER_SERVICE", "SALES"]).default("COLLECTIONS"),
  speakingStyle: z.enum(["PROFESSIONAL", "FRIENDLY", "ASSERTIVE"]).default("PROFESSIONAL"),
});

export function NewAgentDrawer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      voiceId: "",
      voiceType: "female"
    },
  });

  const { data: voices = [] } = useQuery({
    queryKey: ["elevenlabs-voices"],
    queryFn: getVoices
  });

  async function onSubmit(data: z.infer<typeof agentSchema>) {
    try {
      const selectedVoice = voices.find(v => v.voice_id === data.voiceId);
      if (!selectedVoice) {
        throw new Error("Voz no encontrada");
      }

      const agentId = data.useCase === "COLLECTIONS" ? "collections-pro" : "customer-service";

      const result = await createAgent({
        ...data,
        baseAgentId: agentId,
        customConfig: {
          stability: data.stability,
          similarityBoost: data.similarityBoost,
          style: data.style,
          useCase: data.useCase,
          speakingStyle: data.speakingStyle
        }
      });

      if (!result) {
        throw new Error("No se pudo crear el agente");
      }

      toast({
        title: "Agente creado",
        description: "El agente se ha creado correctamente",
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el agente",
      });
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Agente
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Nuevo Agente</SheetTitle>
          <SheetDescription>
            Crea un nuevo agente para llamadas automáticas
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <ScrollArea className="h-max">
              <FormField
                control={form.control}
                name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del agente</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Agente de cobranza" />
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
                    <Textarea
                      {...field}
                      placeholder="Describe el propósito de este agente..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voz del Agente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una voz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {voices?.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          <div className="flex flex-col">
                            <span>{voice.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {voice?.labels.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-2">
                    {field.value && <VoicePreviewButton voiceId={field.value} />}
                    {field.value && (
                      <p className="text-xs text-muted-foreground">
                        {voices?.find(v => v.voice_id === field.value)?.labels.use_case}
                      </p>
                    )}
                  </div>
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
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-4 flex-col">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear agente"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
