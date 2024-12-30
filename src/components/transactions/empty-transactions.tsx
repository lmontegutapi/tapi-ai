import { CircleDollarSign } from "lucide-react"

export function EmptyTransactions() {
 return (
   <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
     <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
       <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
         <CircleDollarSign className="h-10 w-10 text-muted-foreground" />
       </div>

       <h3 className="mt-4 text-lg font-semibold">No hay transacciones</h3>
       <p className="mb-4 mt-2 text-sm text-muted-foreground">
         No hay transacciones registradas en el sistema.
       </p>
     </div>
   </div>
 )
}