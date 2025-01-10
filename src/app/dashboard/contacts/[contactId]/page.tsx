import { getContactDetails, getContactReceivablesPaginated } from "@/actions/contacts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "../../../../components/ui/button";

export default async function ContactDetailPage({ 
  params 
}: { 
  params: { contactId: string } 
}) {
  const contactDetails = await getContactDetails(params.contactId);
  
  if (!contactDetails) {
    notFound();
  }

  const { 
    name, 
    email, 
    phone, 
    paymentMetrics, 
    receivables 
  } = contactDetails;

  const getPagoStatusColor = (category: string) => {
    switch (category) {
      case 'Excelente': return 'bg-green-100 text-green-800';
      case 'Bueno': return 'bg-green-50 text-green-600';
      case 'Regular': return 'bg-yellow-50 text-yellow-600';
      case 'Malo': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{name}</h1>
        <div className="flex items-center space-x-4">
          <Badge 
            className={`${getPagoStatusColor(paymentMetrics.payerCategory)}`}
          >
            Pagador {paymentMetrics.payerCategory}
          </Badge>
          <Button
            variant="outline"
          >
            <Link href={`/payment/${params.contactId}`}>
              Portal de Pago
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {email || 'No disponible'}</p>
            <p>Teléfono: {phone || 'No disponible'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total de Deudas: {paymentMetrics.totalReceivables}</p>
            <p>Deudas Pagadas: {paymentMetrics.paidReceivables}</p>
            <p>Ratio de Pago: {paymentMetrics.paymentRatio.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Deudas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>{new Date(receivable.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(receivable.amountCents / 100)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{receivable.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { contactId: string } }) {
  const contactDetails = await getContactDetails(params.contactId);
  
  return {
    title: contactDetails ? `Detalle de ${contactDetails.name}` : 'Contacto no encontrado',
    description: `Detalles y métricas de pago para ${contactDetails?.name || 'contacto'}`
  };
}