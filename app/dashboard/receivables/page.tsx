import { Suspense } from "react";
import { EmptyState } from "@/components/receivables/empty-state";
import { ReceivablesTable } from "@/components/receivables/table";
//import { getReceivables } from "@/lib/api/receivables"
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceivablesPage() {
  //const receivables = await getReceivables()
  const receivables = [];
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deudas</h1>
      </div>

      {receivables.length === 0 ? (
        <EmptyState />
      ) : (
        <ReceivablesTable data={receivables} />
      )}
    </div>
  );
}
