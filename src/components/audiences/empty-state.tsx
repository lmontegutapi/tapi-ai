import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { NewAudienceDrawer } from "@/components/audiences/new-audience-drawer"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border-2 border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Upload className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No hay audiencias registradas</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Comienza cargando tu primera audiencia para gestionar tus clientes de manera eficiente.
        </p>

        <NewAudienceDrawer />
      </div>
    </div>
  )
}