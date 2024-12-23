"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Users, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { UserRole } from "@/lib/constants/roles";

type Organization = {
  id: string
  name: string
  slug: string
  createdAt: Date
  _count: {
    members: number
    receivables: number
    campaigns: number
  }
  members: {
    user: {
      name: string
      email: string
      role: string
    }
  }[]
}

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Organización",
    cell: ({ row }) => {
      const org = row.original
      return (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{org.name}</div>
            <div className="text-sm text-muted-foreground">{org.slug}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "members",
    header: "Miembros",
    cell: ({ row }) => {
      const owner = row.original.members.find(m => m.user.role === UserRole.OWNER)
      return (
        <div>
          <div className="font-medium">{owner?.user.name || "Sin dueño"}</div>
          <div className="text-sm text-muted-foreground">
            {row.original._count.members} miembros
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "stats",
    header: "Estadísticas",
    cell: ({ row }) => {
      const org = row.original
      return (
        <div className="space-y-1">
          <div className="text-sm">
            {org._count.receivables} deudas
          </div>
          <div className="text-sm">
            {org._count.campaigns} campañas
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creada",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("createdAt"))}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const org = row.original

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
              <Users className="mr-2 h-4 w-4" />
              Ver miembros
            </DropdownMenuItem>
            <DropdownMenuItem>Editar detalles</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 