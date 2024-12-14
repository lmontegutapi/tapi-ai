"use client";

import * as React from "react";
import {
  BarChart,
  BookOpen,
  Bot,
  Building,
  Building2,
  Command,
  DollarSign,
  Frame,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Phone,
  PieChart,
  Send,
  Settings,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavProjects } from "@/components/dashboard/nav-projects";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
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
import { UserRole } from "@/lib/constants/roles";
import Link from "next/link";

const data = {
  user: {
    name: "Usuario Demo",
    email: "demo@cobranzasai.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Campañas",
      url: "/dashboard/campaigns",
      icon: Phone,
      isActive: true,
      allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: "Deudas",
      url: "/dashboard/receivables",
      icon: DollarSign,
      isActive: true,
      allowedRoles: [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT],
    },
    {
      title: "Configuración",
      url: "/dashboard/settings",
      icon: Settings,
      allowedRoles: [UserRole.OWNER, UserRole.ADMIN],
      isActive: true,
    },
  ],
  /* navSecondary: [
    {
      title: "Soporte",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Documentación",
      url: "/docs",
      icon: BookOpen,
    }
  ], */
  organizations: [
    {
      name: "Mi Empresa S.A.",
      url: "/dashboard?org=1",
      icon: Building,
    },
    {
      name: "Otra Empresa LLC",
      url: "/dashboard?org=2",
      icon: Building2,
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {  
  return (
    <Sidebar variant="inset" {...props} className="bg-muted/50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
                        fill="url(#paint0_linear_238_1296)"
                      />
                    </g>
                    <defs>
                      <linearGradient
                        id="paint0_linear_238_1296"
                        x1="20.5"
                        y1="16"
                        x2="100"
                        y2="200"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#01431D" />
                        <stop offset="1" stopColor="#00EE9F" />
                      </linearGradient>
                      <clipPath id="clip0_238_1296">
                        <rect width="200" height="200" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <h3 className="truncate font-bold">
                    TapFlow
                  </h3>
                  <span className="truncate text-xs">AI-powered</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          items={data.navMain}
        />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
