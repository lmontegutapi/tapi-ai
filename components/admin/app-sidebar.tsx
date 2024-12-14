"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Building,
  Users,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Organizaciones",
      url: "/admin/organizations",
      icon: Building,
      isActive: true,
    },
    {
      title: "Usuarios",
      url: "/admin/users",
      icon: Users,
      isActive: true,
    },
    {
      title: "Configuración",
      url: "/admin/settings",
      icon: Settings,
      isActive: true,
    },
  ],
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props} className="bg-muted/50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                  <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_238_1296)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <h3 className="truncate font-bold">
                    TapFlow Admin
                  </h3>
                  <span className="truncate text-xs">Panel de Control</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
} 