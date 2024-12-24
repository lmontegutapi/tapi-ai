"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Campaign } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VoiceSelector } from "./voice-selector"
import { CampaignAutomationForm } from "./automation-form"
import { ReceivablesSelect } from "../receivables/receivables-select"
import { ReceivableWithContact } from "@/types/receivables"
import { AgentSelector } from "./agent-selector"

const campaignSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  context: z.string().min(10, "El contexto debe tener al menos 10 caracteres"),
  objective: z.string().min(10, "El objetivo debe tener al menos 10 caracteres"),
  welcomeMessage: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  callsPerUser: z.coerce.number().min(1).max(10),
  agentId: z.string().min(1, "Debes seleccionar un agente"),
  voiceId: z.string().min(1, "Debes seleccionar una voz"),
  voiceName: z.string(),
  voicePreviewUrl: z.string().optional(),
  receivableIds: z.array(z.string()).optional(),
})

interface CampaignFormProps {
  campaign?: Campaign
  receivables: ReceivableWithContact[]
  onSubmit: (data: z.infer<typeof campaignSchema>) => Promise<void>
  isSubmitting?: boolean
}

export function CampaignForm({ campaign, receivables, onSubmit, isSubmitting }: CampaignFormProps) {
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign?.name ?? "",
      context: campaign?.context ?? "",
      objective: campaign?.objective ?? "",
      welcomeMessage: campaign?.welcomeMessage ?? "",
      startDate: campaign?.startDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0],
      endDate: campaign?.endDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0],
      startTime: campaign?.startTime ?? "09:00",
      endTime: campaign?.endTime ?? "18:00",
      callsPerUser: campaign?.callsPerUser ?? 3,
      agentId: campaign?.agentId ?? "",
      voiceId: campaign?.voiceId ?? "",
      voiceName: campaign?.voiceName ?? "",
      voicePreviewUrl: campaign?.voicePreviewUrl ?? "",
      receivableIds: [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la campaña</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cobranza mensual Diciembre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agente</FormLabel>
                  <FormControl>
                    <AgentSelector
                      onSelect={({ id }) => {
                        form.setValue("agentId", id)
                      }}
                      {...field}
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
                  <FormLabel>Voz del agente</FormLabel>
                  <FormControl>
                    <VoiceSelector 
                      onSelect={(voice) => {
                        form.setValue("voiceId", voice.id)
                        form.setValue("voiceName", voice.name)
                        form.setValue("voicePreviewUrl", voice.previewUrl)
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexto de la empresa</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el contexto..." className="resize-none" {...field} />
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
                    <Textarea placeholder="¿Qué buscas lograr?" className="resize-none" {...field} />
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
                    <Textarea placeholder="Mensaje inicial..." className="resize-none" {...field} />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="callsPerUser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Llamadas por contacto</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <CampaignAutomationForm /> */}
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-4">
          <Button variant="outline" type="button" className="w-full">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {campaign ? "Actualizando..." : "Creando..."}
              </>
            ) : campaign ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}