"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ActionCell } from "./action-cell"
import { Checkbox } from "@/components/ui/checkbox"

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "delinquencyBucket",
    header: "Morosidad",
    cell: ({ row }) => {
      const bucket = row.getValue("delinquencyBucket") as string;
      return (
        <Badge variant={
          bucket === "CURRENT" ? "default" :
          bucket === "PAST_DUE_30" ? "secondary" :
          "destructive"
        }>
          {bucket === "CURRENT" ? "Al día" :
           bucket === "PAST_DUE_30" ? "30 días" :
           bucket === "PAST_DUE_60" ? "60 días" :
           bucket === "PAST_DUE_90" ? "90 días" :
           "Más de 90 días"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contactPreference",
    header: "Canal",
    cell: ({ row }) => {
      const channel = row.getValue("contactPreference") as string;
      return (
        <Badge variant="outline">
          {channel === "WHATSAPP" ? "WhatsApp" :
           channel === "VOICE_AI" ? "Llamada" : "Email"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "campaigns",
    header: "Campañas",
    cell: ({ row }) => {
      const campaigns = row.original.campaigns;
      return <div>{campaigns?.length || 0} campaña(s)</div>;
    },
  },
  {
    accessorKey: "receivables",
    header: "Deudas",
    cell: ({ row }) => {
      const receivables = row.original.receivables;
      return <div>{receivables?.length || 0} deuda(s)</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell audience={row.original} />,
  },
];