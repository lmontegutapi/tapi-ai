"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building, CreditCard, User, Calendar, Banknote } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getClientAndReceivables } from "@/actions/public-client";
import { Receivable, Contact } from "@prisma/client";

export default function PaymentPage({ params }: { params: { contactId: string } }) {
  const [client, setClient] = useState<Contact | null>(null);
  const [receivables, setReceivables] = useState<Receivable[]>([]);

/*   useEffect(() => {
    async function fetchClientAndReceivables() {
      try {
        const { client, receivables } = await getClientAndReceivables(params.contactId);
        setClient(client);
        setReceivables(receivables);
      } catch (error) {
        console.error("Error fetching client and receivables:", error);
      }
    }

    fetchClientAndReceivables();
  }, [params.contactId]);
   */
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Pago presencial',
      icon: Building,
      description: 'Paga en nuestras oficinas'
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      icon: CreditCard,
      description: "Paga con tu cuenta de Mercado Pago",
    },
    {
      id: "nubank",
      name: "Nubank",
      icon: CreditCard,
      description: "Paga con tu cuenta Nubank",
    },
    {
      id: 'card',
      name: "Tarjeta",
      icon: CreditCard,
      description: "Débito o Crédito",
    },
    {
      id: "transfer",
      name: "Transferencia",
      icon: Banknote,
      description: "Transferencia bancaria",
    }
  ]
 
  return (
    <div className="container max-w-4xl py-10 space-y-6">
      {client && (
        <Card>
          <CardHeader>
            <CardTitle>
              <User className="h-5 w-5 mr-2" />
              {client.name}
            </CardTitle>
            <CardDescription>
              {client.email ?? "No registrado"} | {client.phone ?? "No registrado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Deudas pendientes</h3>
                <div className="space-y-2">
                  {receivables.map((receivable) => (
                    <div key={receivable.id}>
                      <h4>{receivable.amountCents}</h4>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Métodos de pago</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <Button key={method.id}>{method.name}</Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
 }