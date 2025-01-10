"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Audience } from "@prisma/client"
import { ReceivableWithContact } from "../../types/receivables"
import { Campaign } from "@prisma/client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ResponseAudienceDetails {
  data: {
    audience: Audience & {
      receivables: ReceivableWithContact[];
      campaigns: Campaign[];
    };
    metrics: any;
  }
}

const columns: ColumnDef<ReceivableWithContact>[] = [
  {
    accessorKey: "contact",
    header: "Cliente",
    cell: ({ row }) => {
      const contact = row.original.contact
      return (
        <div>
          <p className="font-medium">{contact.name}</p>
          <p className="text-sm text-muted-foreground">{contact.email}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.dueDate)}</div>
    },
  },
  {
    accessorKey: "amountCents",
    header: "Monto",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {formatCurrency(row.original.amountCents)}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      return (
        <Badge
          variant={
            row.original.status === "OPEN"
              ? "default"
              : row.original.status === "OVERDUE"
              ? "destructive"
              : "secondary"
          }
        >
          {row.original.status}
        </Badge>
      )
    },
  },
]

export function AudienceSummaryView({ 
  audienceDetails 
}: { 
  audienceDetails: ResponseAudienceDetails 
}) {
  if (!audienceDetails) return null;
  const { audience, metrics } = audienceDetails.data;
  const { receivables, campaigns } = audience;

  const table = useReactTable({
    data: receivables || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  })

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{audience.name}</h1>
          <p className="text-muted-foreground">{audience.description}</p>
        </div>
        <Badge variant="outline">
          {audience.delinquencyBucket === "CURRENT" ? "Al día" :
           audience.delinquencyBucket === "PAST_DUE_30" ? "30 días" : 
           audience.delinquencyBucket === "PAST_DUE_60" ? "60 días" : "90+ días"}
        </Badge>
      </div>

      {/* Métricas Principales */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              title="Total Deuda"
              value={formatCurrency(metrics.totalAmount)}
            />
            <MetricCard
              title="Deudas"
              value={metrics.totalReceivables}
            />
            <MetricCard
              title="Contactos"
              value={metrics.totalContacts}
            />
            <MetricCard
              title="Campañas"
              value={metrics.campaignsCount}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6">
        {/* Lista de Deudas en Tabla - Lado izquierdo */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Deudas en esta audiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No hay resultados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campañas Activas - Card flotante derecha */}
        <div className="w-[350px]">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Campañas Activas</span>
                  <Badge variant="secondary">{audience.campaigns.filter(c => c.status === "ACTIVE").length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {audience.campaigns
                      .filter(c => c.status === "ACTIVE")
                      .map((campaign) => (
                        <Card key={campaign.id} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold">{campaign.name}</h4>
                                <Badge variant="default">
                                  {campaign.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <span>Progreso</span>
                                <span className="font-medium">
                                  {campaign.completedCalls}/{campaign.totalCalls}
                                </span>
                              </div>
                              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary h-full transition-all"
                                  style={{ 
                                    width: `${(campaign.completedCalls / campaign.totalCalls) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}