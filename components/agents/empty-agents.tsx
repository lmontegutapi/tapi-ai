import { Plus, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyAgents() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Phone className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No hay agentes</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Crea tu primer agente para comenzar a gestionar tus llamadas de manera automática.
        </p>

        <Button asChild>
          <Link href="/dashboard/agents">
            <Plus className="mr-2 h-4 w-4" />
            Crear primer agente
          </Link>
        </Button>
      </div>
    </div>
  )
}
