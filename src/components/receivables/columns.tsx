"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ReceivableWithContact } from "@/types/receivables"
import { ActionCell } from "./action-cell"
import { Checkbox } from "@/components/ui/checkbox"
import { Campaign } from "@prisma/client"

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
        className="rounded-xs"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="rounded-xs"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "contact.identifier",
    header: "Identificador",
    cell: ({ row }) => {
      const identifier = row.original.contact.identifier
      return <div className="w-[100px]">{identifier || "Sin identificador"}</div>
    },
  },
  {
    accessorKey: "contact",
    header: "Cliente",
    cell: ({ row }) => {
      const receivable = row.original
      return (
        <div>
          <div className="font-medium truncate min-w-[120px]">{receivable.contact.name}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "contact.phone",
    header: "Teléfono",
    cell: ({ row }) => {
      const phone = row.original.contact.phone
      return <div className="w-[100px]">{phone || "Sin teléfono"}</div>
    },
  },
  {
    accessorKey: "contact.email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.contact.email
      return <div className="min-w-[100px] truncate">{email || "Sin email"}</div>
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amountCents = row.original.amountCents
      return <div className="font-medium">{formatCurrency(amountCents)}</div>
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("dueDate"))}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold 
          ${
            status === "OPEN"
              ? "bg-blue-100 text-blue-800"
              : status === "OVERDUE"
              ? "bg-red-100 text-red-800"
              : status === "CLOSED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "OPEN"
            ? "Pendiente"
            : status === "OVERDUE"
            ? "Vencido"
            : status === "CLOSED"
            ? "Cerrado"
            : "Otro"}
        </span>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Concepto",
    cell: ({ row }) => {
      return <div>{row.getValue("notes") || "Sin concepto"}</div>
    },
  },
/*   {
    accessorKey: "audiences ",
    header: "Audiencias",
    cell: ({ row }) => {
      return <div
        className="w-[120px]"
      >{row.original.audiences.map((audience: any) => audience.name).join(", ")}</div>
    },
  }, */
  {
    accessorKey: "campaign",
    header: "Campaña",
    cell: ({ row }) => {
      const campaignByAudience = row.original.audiences.map((audience: any) => audience.campaigns).flat()
      const campaign = campaignByAudience.length > 0 ? campaignByAudience[0] : null
      
      if (!campaign) {
        return (
          <span className="text-muted-foreground text-sm w-[120px]">
            Sin campaña
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1 w-[120px]">
          <span className="text-sm font-medium">
            {campaign.name}
          </span>
          <Badge className="max-w-fit" variant={
            campaign.status === "ACTIVE" ? "default" :
            campaign.status === "PAUSED" ? "secondary" :
            campaign.status === "COMPLETED" ? "outline" : 
            "destructive"
          }>
            {campaign.status === "ACTIVE" ? "Activa" :
             campaign.status === "PAUSED" ? "Pausada" :
             campaign.status === "COMPLETED" ? "Completada" :
             "Cancelada"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell receivable={row.original} />
  }
]
