import { Suspense } from "react";
import { EmptyState } from "@/components/receivables/empty-state";
import { ReceivablesTable } from "@/components/receivables/table";
import { getReceivables } from "@/actions/receivables"
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableWrapper } from "@/components/shared/data-table-wrapper";
import { columns } from "@/components/receivables/columns";
import { NewReceivableDrawer } from "@/components/receivables/new-receivable-drawer";
import { UploadLinkButton } from "@/components/receivables/upload-link-button";

export const dynamic = 'force-dynamic';
export default async function ReceivablesPage() {
  const receivablesResponse = await getReceivables();
  const receivables = Array.isArray(receivablesResponse.data) ? receivablesResponse.data : [];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deudas</h1>
      </div>

      <DataTableWrapper
        data={receivables}
        columns={columns}
        EmptyStateComponent={EmptyState}
        searchKey="name"
        actionComponent={<NewReceivableDrawer />}
        secondaryActionComponent={<UploadLinkButton />}
        defaultVisibility={{
          contact: true,
          amountCents: true,
          dueDate: true,
          status: true,
          notes: true,
          campaign: true,
        }}
      />
    </div>
  );
}
