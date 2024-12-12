import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import NextBreadcrumb from "@/components/next-breadcrumbs";
import { Suspense } from "react";
import DashboardLoading from "./loading";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/50">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NextBreadcrumb
                homeElement={<span>🏠 Dashboard</span>}
                capitalizeLinks={true}
              />
            </div>
          </header>
          <Suspense fallback={<DashboardLoading />}>
            <div className="p-4">{children}</div>
          </Suspense>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
