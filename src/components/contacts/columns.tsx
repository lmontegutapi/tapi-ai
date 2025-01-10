"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@/types/contacts";
import { MoreHorizontal, FileText, CircleDollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ContactPhone } from "@prisma/client";

function ActionsCell({ row }: { row: any }) {
  const contact = row.original;
  const router = useRouter();

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/payment/${contact.id}`
    );
    toast({
      title: "Link copiado",
      description: "Link de pago copiado al portapapeles",
    });
  };

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
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyPaymentLink}>
          <CircleDollarSign className="mr-2 h-4 w-4" />
          Copiar link de pago
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/contacts/${contact.id}/edit`)}
        >
          Editar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ContactWithPhones extends Contact {
  phones: ContactPhone[];
}

export const columns: ColumnDef<ContactWithPhones, any>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "identifier",
    header: "Identificador",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email;
      return email ? <div>{email}</div> : <div className="text-muted-foreground">N/A</div>;
    },
  },
  {
    accessorKey: "phones",
    header: "Teléfonos",
    cell: ({ row }) => {
      const mainPhone = row.original.phone;
      const additionalPhones = row.original.phones;
      
      return (
        <div className="space-y-1">
          {mainPhone && (
            <div className="text-sm">
              <Badge variant="default">MAIN</Badge>{" "}
              <span>{mainPhone}</span>
            </div>
          )}
          {additionalPhones?.map((phone) => (
            <div key={phone.id} className="text-sm">
              <Badge variant="secondary">{phone.type}</Badge>{" "}
              <span>{phone.phone}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de registro",
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt);
      const formattedDate = createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return <p>{formattedDate}</p>;
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
