import { Suspense } from "react";
import { EmptyState } from "@/components/receivables/empty-state";
import { ReceivablesTable } from "@/components/receivables/table";
import { getReceivables } from "@/actions/receivables"
import { TableSkeleton } from "@/components/table-skeleton";

export default async function ReceivablesPage() {
  const receivables = await getReceivables()

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deudas</h1>
      </div>

      {!receivables || receivables.length === 0 ? (
        <EmptyState />
      ) : (
        <Suspense fallback={<TableSkeleton columnCount={7} rowCount={5} />}>
          <ReceivablesTable data={receivables} />
        </Suspense>
      )}
    </div>
  );
}
