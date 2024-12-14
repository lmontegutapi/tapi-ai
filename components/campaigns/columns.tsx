"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Campaign } from "@prisma/client"
import { MoreHorizontal, Play, Pause, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Campaign>[] = [
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
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "default"
              : status === "COMPLETED"
              ? "default"
              : status === "PAUSED"
              ? "destructive"
              : "secondary"
          }
        >
          {status === "ACTIVE"
            ? "Activa"
            : status === "COMPLETED"
            ? "Completada"
            : status === "PAUSED"
            ? "Pausada"
            : status === "DRAFT"
            ? "Borrador"
            : "Cancelada"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "progress",
    header: "Progreso",
    cell: ({ row }) => {
      const campaign = row.original
      const progress = Math.round(
        (campaign.completedCalls / campaign.totalCalls) * 100
      )
      return (
        <div className="w-[180px]">
          <div className="flex justify-between text-xs mb-1">
            <span>{progress}%</span>
            <span className="text-muted-foreground">
              {campaign.completedCalls}/{campaign.totalCalls}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )
    },
  },
  {
    accessorKey: "dateRange",
    header: "Período",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm">
            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
          </span>
          <span className="text-xs text-muted-foreground">
            {campaign.startTime} - {campaign.endTime}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "callsPerUser",
    header: "Llamadas/Contacto",
    cell: ({ row }) => row.original.callsPerUser,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original

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
            <DropdownMenuItem>
              <Phone className="mr-2 h-4 w-4" />
              Ver llamadas
            </DropdownMenuItem>
            <DropdownMenuItem>
              {campaign.status === "ACTIVE" ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar campaña
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activar campaña
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              disabled={campaign.status === "COMPLETED"}
            >
              Cancelar campaña
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]