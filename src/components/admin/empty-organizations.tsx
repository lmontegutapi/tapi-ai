import { Building } from "lucide-react"
import { NewOrganizationDrawer } from "./new-organization-drawer"

export function EmptyOrganizations() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border-2 border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Building className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No hay organizaciones registradas</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Comienza creando tu primera organización para gestionar sus cobranzas.
        </p>

        <NewOrganizationDrawer />
      </div>
    </div>
  )
} 