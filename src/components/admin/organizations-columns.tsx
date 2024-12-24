"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { MoreHorizontal, Users, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { UserRole } from "@/lib/constants/roles";
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { revalidatePath } from "next/cache"

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

async function deleteOrganization(id: string) {
  await authClient.organization.delete({ organizationId: id })
  revalidatePath("/admin/organizations")
}

function ActionCell({ row }: { row: Row<Organization> }) {
  const router = useRouter()
  const org = row.original
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsOpen(!isOpen)}>
          <Users className="mr-2 h-4 w-4" />
          Ver miembros
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => deleteOrganization(org.id)}>
            Desactivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Miembros de {org.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Aquí puedes ver los miembros de la organización.
          </DialogDescription>
          <table className="table-auto">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {org.members.map((member) => (
                <tr key={member.user.email}>
                  <td>{member.user?.name}</td>
                  <td>{member.user?.email}</td>
                  <td>{member.user?.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <DialogFooter>
            <Button onClick={() => setIsOpen(!isOpen)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
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
      const owner = row.original.members?.find(m => m.user.role === UserRole.OWNER)
      return (
        <div>
          <div className="font-medium">{owner?.user.name || "Sin dueño"}</div>
          <div className="text-sm text-muted-foreground">
            {row.original._count?.members} miembros
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
            {org._count?.receivables} deudas
          </div>
          <div className="text-sm">
            {org._count?.campaigns} campañas
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
        <ActionCell row={row} />
      )
    },
  },
]