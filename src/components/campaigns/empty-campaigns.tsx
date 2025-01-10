import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignDialog } from "./campaign-dialog";
import { createCampaign } from "@/actions/campaigns";

interface EmptyCampaignsProps {
  agents?: any[];
  audiences?: any[];
}

export function EmptyCampaigns({ agents, audiences }: EmptyCampaignsProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Phone className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No hay campañas</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Crea tu primera campaña para comenzar a gestionar tus cobranzas de
          manera automática.
        </p>
      </div>

      <CampaignDialog 
        audiences={audiences}
        onSubmit={createCampaign}
        trigger={
          <Button size="lg" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Crear primera campaña
          </Button>
        }
      />
    </div>
  );
}