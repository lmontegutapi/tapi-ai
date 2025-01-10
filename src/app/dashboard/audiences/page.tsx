import { DataTableWrapper } from "@/components/shared/data-table-wrapper";
import { EmptyState } from "@/components/audiences/empty-state";
import { NewAudienceDrawer } from "@/components/audiences/new-audience-drawer";
import { columns } from "@/components/audiences/columns";
import { getAudiences } from "@/actions/audiences";

export const dynamic = 'force-dynamic';

export default async function AudiencesPage() {
  const { data: audiences = [] } = await getAudiences();

  console.log("audiences", audiences);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audiencias</h1>
      </div>

      <DataTableWrapper
        data={audiences}
        columns={columns}
        EmptyStateComponent={EmptyState}
        searchKey="name"
        actionComponent={<NewAudienceDrawer variantButton="default" />}
        defaultVisibility={{
          name: true,
          delinquencyBucket: true,
          contactPreference: true,
          campaigns: true,
        }}
      />
    </div>
  );
}