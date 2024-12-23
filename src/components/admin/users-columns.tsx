"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@prisma/client"
import { MoreHorizontal, Building, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { UserRole, roleMetadata } from "@/lib/constants/roles"

export type UserWithMembers = User & {
  members: {
    organization: {
      id: string
      name: string
    }
  }[]
}

export const columns: ColumnDef<UserWithMembers>[] = [
  {
    accessorKey: "name",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      const { label, variant } = roleMetadata[role] || { 
        label: role, 
        variant: "ghost" 
      }
      
      return (
        <Badge variant={variant as any}>
          <Shield className="mr-1 h-3 w-3" />
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "organizations",
    header: "Organizaciones",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="space-y-1">
          {user.members.map((member) => (
            <div key={member.organization.id} className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{member.organization.name}</span>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.getValue("createdAt"))}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

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
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            <DropdownMenuItem>Editar permisos</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              {user.emailVerified ? "Desactivar cuenta" : "Reenviar verificación"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 