"use client"

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building, CreditCard, Banknote, Wallet } from "lucide-react";
import { updatePaymentSettings } from "@/actions/payment-settings";
import { toast } from "@/hooks/use-toast";

const PAYMENT_METHODS = [
  {
    id: 'CASH',
    icon: Building,
    title: 'Pago Presencial',
    description: 'Habilitar pagos en locales adheridos'
  },
  {
    id: 'BANK_TRANSFER',
    icon: Banknote,
    title: 'Transferencia Bancaria',
    description: 'Habilitar pagos por transferencia'
  },
  {
    id: 'CARD',
    icon: CreditCard,
    title: 'Tarjetas',
    description: 'Habilitar pagos con tarjeta'
  },
  {
    id: 'DIGITAL_WALLET',
    icon: Wallet,
    title: 'Billeteras Digitales',
    description: 'Habilitar pagos con billeteras digitales'
  }
] as const;

interface PaymentSettingsProps {
  settings?: Record<string, boolean>
}

export function PaymentSettings({ settings = {} }: PaymentSettingsProps) {
  const [loading, setLoading] = useState(false);

  console.log("settings", settings);

  // Merge default settings with provided settings
  /* const paymentSettings = PAYMENT_METHODS.reduce((acc, method) => {
    // Default to false if not specified, respect existing settings
    acc[method.id] = settings.payments?.[method.id] ?? false;
    return acc;
  }, {} as Record<string, boolean>); */


  const handleToggle = async (method: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await updatePaymentSettings(method, isActive);
      
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
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {PAYMENT_METHODS.map((method) => (
          <div key={method.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <method.icon className="h-5 w-5" />
              <div className="space-y-0.5">
                <Label>{method.title}</Label>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.[method.id]}
              onCheckedChange={(isActive) => handleToggle(method.id, isActive)}
              disabled={loading}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}