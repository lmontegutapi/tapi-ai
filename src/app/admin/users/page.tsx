import { UsersList } from "@/components/admin/users-list";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
      </div>
      <UsersList />
    </div>
  );
} 