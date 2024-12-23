"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Agent } from "@prisma/client";
import { MoreHorizontal, Bot, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditAgentDrawer } from "@/components/agents/edit-agent-drawer";

function ActionCell({ agent }: { agent: Agent }) {
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  
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
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ver estadísticas</DropdownMenuItem>
          <DropdownMenuItem
            className={agent.isActive ? "text-destructive" : "text-green-600"}
          >
            <Power className="mr-2 h-4 w-4" />
            {agent.isActive ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAgentDrawer
        agent={agent}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
      />
    </>
  );
}

export const columns: ColumnDef<Agent>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <span>{agent.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "voiceType",
    header: "Tipo de Voz",
    cell: ({ row }) => {
      const voiceType = row.getValue("voiceType") as string;
      return (
        <Badge variant="outline">
          {voiceType === "male" ? "Masculina" : "Femenina"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const agent = row.original;
      return <ActionCell agent={agent} />;
    },
  },
];
