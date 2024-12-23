import { redirect } from "next/navigation";
import { session } from "@/lib/auth-server";
import { AdminSidebar } from "@/components/admin/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NextBreadcrumb from "@/components/next-breadcrumbs";
import { Suspense } from "react";
import { UserRole } from "@/lib/constants/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await session();
  
  if (!auth?.user || auth.user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-muted/50">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NextBreadcrumb
                homeElement={<span>🔒 Admin</span>}
                capitalizeLinks={true}
              />
            </div>
          </header>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="p-4">{children}</div>
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
} 