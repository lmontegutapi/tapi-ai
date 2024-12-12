"use client"

import { useState } from "react"
import { Call } from "@prisma/client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatDuration } from "@/lib/utils"

const columns: ColumnDef<Call>[] = [
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "COMPLETED"
              ? "default"
              : status === "FAILED"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "duration",
    header: "Duración",
    cell: ({ row }) => formatDuration(row.getValue("duration")),
  },
  {
    accessorKey: "paymentPromise",
    header: "Promesa de Pago",
    cell: ({ row }) => {
      const hasPromise = row.getValue("paymentPromise") as boolean
      return hasPromise ? (
        <Badge variant="default">Sí</Badge>
      ) : (
        <Badge variant="secondary">No</Badge>
      )
    },
  },
  {
    accessorKey: "promisedAmount",
    header: "Monto Prometido",
    cell: ({ row }) => {
      const amount = row.getValue("promisedAmount") as number
      return amount ? (
        <span className="font-mono">
          {amount.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
          })}
        </span>
      ) : (
        "-"
      )
    },
  },
]

interface CallsTableProps {
  calls: Call[]
}

export function CallsTable({ calls }: CallsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: calls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
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
                <TableRow key={row.id}>
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
                  No hay llamadas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}