import { PaymentType } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Banknote, CreditCard, Wallet, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentMethodsProps {
  receivable: any;
  organization: any;
}

const PAYMENT_CONFIG = {
  CASH: {
    icon: Building,
    title: "Pago Presencial",
    description: "Paga en nuestras sucursales",
  },
  BANK_TRANSFER: {
    icon: Banknote,
    title: "Transferencia",
    description: "Transfiere a nuestra cuenta",
  },
  CARD: {
    icon: CreditCard,
    title: "Tarjeta",
    description: "Paga con débito o crédito",
  },
  DIGITAL_WALLET: {
    icon: Wallet,
    title: "Billetera Digital",
    description: "Mercado Pago, Ualá, MODO",
  },
} as const;

export function PaymentMethods({
  receivable,
  organization,
}: PaymentMethodsProps) {
  // Filtrar solo los métodos habilitados
  const enabledMethods = Object.entries(organization?.settings?.payments || {})
    .filter(([_, enabled]) => enabled)
    .map(([method]) => method as PaymentType);

  const generarCuentaBancaria = () =>
    Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
      ""
    );

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Cuenta clabe copiada",
    });
  };

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
                    {
                      method === "BANK_TRANSFER"
                        ? `Clabe: ${generarCuentaBancaria()}`
                        : config.description
                    }
                  </p>
                </div>
              </div>
              {method === "BANK_TRANSFER" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCopy(generarCuentaBancaria());
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copiar
                </Button>
              ) : (
                <Button variant="outline">Pagar</Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
