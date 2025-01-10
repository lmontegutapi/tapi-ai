import { PaymentType } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Banknote, CreditCard, Wallet } from "lucide-react";

interface PaymentMethodsProps {
  receivable: any;
  organization: any;
}

const PAYMENT_CONFIG = {
  CASH: {
    icon: Building,
    title: "Pago Presencial",
    description: "Paga en nuestras sucursales"
  },
  BANK_TRANSFER: {
    icon: Banknote,
    title: "Transferencia",
    description: "Transfiere a nuestra cuenta"
  },
  CARD: {
    icon: CreditCard,
    title: "Tarjeta",
    description: "Paga con débito o crédito"
  },
  DIGITAL_WALLET: {
    icon: Wallet,
    title: "Billetera Digital",
    description: "Mercado Pago, Ualá, MODO"
  }
} as const;

export function PaymentMethods({ receivable, organization }: PaymentMethodsProps) {
  // Filtrar solo los métodos habilitados
  const enabledMethods = Object.entries(organization?.settings?.payments || {})
    .filter(([_, enabled]) => enabled)
    .map(([method]) => method as PaymentType);

  if (enabledMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay métodos de pago habilitados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago</CardTitle>
        <CardDescription>
          ${(receivable.amountCents / 100).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {enabledMethods.map((method) => {
          const config = PAYMENT_CONFIG[method as keyof typeof PAYMENT_CONFIG];
          return (
            <div key={method} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <config.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{config.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Aquí iría la lógica para cada método de pago
                }}
              >
                Pagar
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}