import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AudienceSelect } from "../audiences/audience-select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactRule {
  enabled: boolean;
  daysFromDueDate: number;
  channel: 'WHATSAPP' | 'VOICE_AI';
}

interface FormData {
  name: string;
  context: string;
  objective: string;
  welcomeMessage: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  callsPerUser: number;
  agentId: string;
  voiceId: string;
  audienceIds: string[];
  contactPreferences: {
    rules: ContactRule[];
  }
}

interface CampaignFormProps {
  onSubmit: (data: FormData) => void;
  campaign?: any;
  audiences?: any[];
  isSubmitting: boolean;
}

export function CampaignForm({ onSubmit, campaign, audiences, isSubmitting }: CampaignFormProps) {
  const form = useForm<FormData>({
    defaultValues: {
      name: campaign?.name ?? "",
      context: campaign?.context ?? "",
      objective: campaign?.objective ?? "",
      welcomeMessage: campaign?.welcomeMessage ?? "",
      startDate: campaign?.startDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      endDate: campaign?.endDate?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      startTime: campaign?.startTime ?? "09:00",
      endTime: campaign?.endTime ?? "18:00",
      callsPerUser: campaign?.callsPerUser ?? 3,
      agentId: campaign?.agentId ?? "",
      voiceId: campaign?.voiceId ?? "",
      audienceIds: campaign?.audienceIds ?? [],
      contactPreferences: campaign?.contactPreferences ?? {
        rules: [
          { enabled: true, daysFromDueDate: -3, channel: "WHATSAPP" },
          { enabled: true, daysFromDueDate: 0, channel: "VOICE_AI" },
          { enabled: true, daysFromDueDate: 3, channel: "WHATSAPP" }
        ]
      }
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Columna izquierda - Información básica */}
          <div className="col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Información básica</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la campaña</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Cobranza mensual Diciembre" {...field} />
                      </FormControl>
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
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="callsPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intentos por cliente</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={10} 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Máximo 10 intentos por cliente</FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Contenido</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el contexto de la empresa..." 
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¿Qué buscas lograr con esta campaña?" 
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
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
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audiencias</FormLabel>
                      <FormControl>
                        <AudienceSelect
                          audiences={audiences || []}
                          selectedIds={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Selecciona las audiencias que recibirán las notificaciones
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Reglas de contacto */}
          <div>
            <h3 className="text-lg font-medium mb-4">Reglas de contacto</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contactPreferences.rules"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      {field.value.map((rule, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Regla {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newRules = field.value.filter((_, i) => i !== index);
                                  field.onChange(newRules);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={Math.abs(rule.daysFromDueDate)}
                                  onChange={(e) => {
                                    const newRules = [...field.value];
                                    newRules[index].daysFromDueDate = 
                                      rule.daysFromDueDate < 0 
                                        ? -Number(e.target.value)
                                        : Number(e.target.value);
                                    field.onChange(newRules);
                                  }}
                                  className="w-20"
                                />
                                <span>días</span>
                                <Select 
                                  value={rule.daysFromDueDate < 0 ? 'antes' : 'despues'}
                                  onValueChange={(value) => {
                                    const newRules = [...field.value];
                                    newRules[index].daysFromDueDate = 
                                      value === 'antes'
                                        ? -Math.abs(rule.daysFromDueDate)
                                        : Math.abs(rule.daysFromDueDate);
                                    field.onChange(newRules);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="antes">antes</SelectItem>
                                    <SelectItem value="despues">después</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-2">
                                <span>vía</span>
                                <Select
                                  value={rule.channel}
                                  onValueChange={(value: 'WHATSAPP' | 'VOICE_AI') => {
                                    const newRules = [...field.value];
                                    newRules[index].channel = value;
                                    field.onChange(newRules);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                    <SelectItem value="VOICE_AI">Llamada</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newRules = [
                            ...field.value,
                            { enabled: true, daysFromDueDate: 0, channel: "WHATSAPP" }
                          ];
                          field.onChange(newRules);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar regla
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 py-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {campaign ? "Actualizando..." : "Creando..."}
              </>
            ) : campaign ? (
              "Actualizar campaña"
            ) : (
              "Crear campaña"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}