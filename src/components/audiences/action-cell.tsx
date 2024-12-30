"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Pencil,
  RefreshCcw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Audience } from "@prisma/client";
import { EditAudienceDrawer } from "@/components/audiences/edit-audience-drawer";
import { deleteAudience } from "@/actions/audiences";
import Link from "next/link";
import { syncAudienceMembers } from "@/actions/audiences";

export function ActionCell({ audience }: { audience: Audience }) {
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    try {
      const res = await syncAudienceMembers(audience.id);

      console.log("res", res);

      if (!res.success) throw new Error(res.error);

      toast({
        title: "Audiencia sincronizada",
        description: "Los contactos han sido actualizados",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo sincronizar la audiencia",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteAudience(audience.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Audiencia eliminada",
        description: "La audiencia se ha eliminado correctamente",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar la audiencia",
      });
    }
  };

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
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDrawer(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSync}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Sincronizar contactos
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/audiences/${audience.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAudienceDrawer
        audience={audience}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
      />
    </>
  );
}
