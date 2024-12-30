// components/transactions/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/types/transactions";
import { MoreHorizontal, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

function ActionsCell({ row }: { row: any }) {
  const transaction = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        {transaction.invoice && (
          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            Ver factura
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Transaction>[] = [
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
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "date",
    header: "Fecha",
  },
  {
    accessorKey: "fromTo",
    header: "De/Para",
  },
  {
    accessorKey: "invoice",
    header: "Factura",
    cell: ({ row }) => {
      const invoice = row.original.invoice;
      if (!invoice) return null;
      return (
        <Button variant="ghost" size="sm">
          Ligar factura
        </Button>
      );
    },
  },
  {
    accessorKey: "user",
    header: "Usuario",
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const formatted = formatCurrency(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Procesado"
              ? "default"
              : status === "Pendiente"
                ? "secondary"
                : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
