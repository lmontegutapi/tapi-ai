import { OrganizationsList } from "@/components/admin/organizations-list";

export default function OrganizationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Organizaciones</h2>
      </div>
      <OrganizationsList />
    </div>
  );
} 