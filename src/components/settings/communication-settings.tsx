"use client"

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mic } from "lucide-react";
import { updateCommunicationSettings } from "@/actions/communication-settings";
import { toast } from "@/hooks/use-toast";

export function CommunicationSettings({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (key: string, value: any) => {
    setLoading(true);
    try {
      const response = await updateCommunicationSettings({
        ...settings,
        [key]: value
      });

      if (response.success) {
        toast({
          title: "Configuración actualizada",
          description: "Los cambios se guardaron correctamente"
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Business */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <CardTitle>WhatsApp Business</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar WhatsApp Business</Label>
              <p className="text-sm text-muted-foreground">
                Activa la comunicación por WhatsApp con tus clientes
              </p>
            </div>
            <Switch 
              checked={settings.whatsapp?.enabled}
              disabled={loading}
              onCheckedChange={(enabled) => handleUpdate('whatsapp', {
                ...settings.whatsapp,
                enabled
              })}
            />
          </div>

          {settings.whatsapp?.enabled && (
            <div className="space-y-4">
              <div>
                <Label>Nombre del negocio</Label>
                <Input 
                  value={settings.whatsapp?.businessProfile?.name || ''}
                  onChange={(e) => handleUpdate('whatsapp', {
                    ...settings.whatsapp,
                    businessProfile: {
                      ...settings.whatsapp.businessProfile,
                      name: e.target.value
                    }
                  })}
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea 
                  value={settings.whatsapp?.businessProfile?.description || ''}
                  onChange={(e) => handleUpdate('whatsapp', {
                    ...settings.whatsapp,
                    businessProfile: {
                      ...settings.whatsapp.businessProfile,
                      description: e.target.value
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bot de IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita un asistente virtual para respuestas automáticas
                  </p>
                </div>
                <Switch 
                  checked={settings.whatsapp?.bot?.enabled}
                  onCheckedChange={(enabled) => handleUpdate('whatsapp', {
                    ...settings.whatsapp,
                    bot: {
                      ...settings.whatsapp.bot,
                      enabled
                    }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice AI */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <CardTitle>Voice AI</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar llamadas con IA</Label>
              <p className="text-sm text-muted-foreground">
                Activa las llamadas automáticas usando inteligencia artificial
              </p>
            </div>
            <Switch 
              checked={settings.voiceAI?.enabled}
              disabled={loading}
              onCheckedChange={(enabled) => handleUpdate('voiceAI', {
                ...settings.voiceAI,
                enabled
              })}
            />
          </div>

          {settings.voiceAI?.enabled && (
            <div className="space-y-4">
              <div>
                <Label>Voice ID</Label>
                <Input 
                  value={settings.voiceAI?.voiceId || ''}
                  onChange={(e) => handleUpdate('voiceAI', {
                    ...settings.voiceAI,
                    voiceId: e.target.value
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}