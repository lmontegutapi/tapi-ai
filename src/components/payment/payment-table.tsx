import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PaymentTableProps {
  receivables: any[]
  selectedReceivable: any
  onReceivableSelect: (receivable: any) => void
}

export function PaymentTable({ 
  receivables, 
  selectedReceivable, 
  onReceivableSelect 
}: PaymentTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <span className="sr-only">Selección</span>
            </TableHead>
            <TableHead>Fecha de vencimiento</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Identificador</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivables.map((receivable) => (
            <TableRow 
              key={receivable.id}
              className={selectedReceivable?.id === receivable.id ? 'bg-slate-50' : ''}
            >
              <TableCell>
                <Checkbox
                  checked={selectedReceivable?.id === receivable.id}
                  onCheckedChange={() => {
                    if (selectedReceivable?.id === receivable.id) {
                      onReceivableSelect(null)
                    } else {
                      onReceivableSelect(receivable)
                    }
                  }}
                  aria-label={`Seleccionar deuda de ${(receivable.amountCents / 100).toFixed(2)}`}
                />
              </TableCell>
              <TableCell>
                {format(new Date(receivable.dueDate), "dd 'de' MMMM, yyyy", { locale: es })}
              </TableCell>
              <TableCell className="font-medium">
                ${(receivable.amountCents / 100).toFixed(2)}
              </TableCell>
              <TableCell>
                {receivable.isPastDue ? (
                  <Badge variant="destructive">Vencido</Badge>
                ) : (
                  <Badge variant="outline">Pendiente</Badge>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {receivable.paymentId || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}