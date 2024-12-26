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
      title: "Deudas",
      url: "/dashboard/receivables",
      icon: DollarSign,
      isActive: true,
    },
    {
      title: "Campañas",
      url: "/dashboard/campaigns",
      icon: Phone,
      isActive: true,
    },
    {
      title: "Configuración",
      url: "/dashboard/settings",
      icon: Settings,
      //allowedRoles: [UserRole.OWNER, UserRole.ADMIN],
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground w-2/4">
                <svg width="540" height="177" viewBox="0 0 540 177" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M206.008 105.805V54.9224H191.834V39.4759H207.099V17.1241H225.816V39.4759H249.804V54.9224H225.816V104.533C225.816 112.892 230.904 118.707 239.263 118.707C241.808 118.707 246.047 118.707 249.622 118.707V135.292C244.411 135.426 238.355 135.426 233.267 135.426C216.73 135.426 206.008 123.432 206.008 105.805Z" fill="black"/>
<path d="M317.276 121.211C334.904 121.211 347.624 107.764 347.624 89.0462C347.624 70.3288 334.904 56.8813 317.276 56.8813C299.649 56.8813 286.747 70.3288 286.747 89.0462C286.747 107.582 299.649 121.211 317.276 121.211ZM347.806 56.6996V42.8887H367.614V135.204H347.806V121.393C339.992 132.296 327.816 138.838 313.46 138.838C286.384 138.838 267.121 117.94 267.121 89.0462C267.121 60.1523 286.384 39.2542 313.46 39.2542C327.816 39.2542 339.992 45.7962 347.806 56.6996Z" fill="black"/>
<path d="M443.183 120.303C460.81 120.303 473.713 107.037 473.713 89.0462C473.713 70.6922 460.629 57.7899 443.183 57.7899C425.556 57.7899 412.836 71.0557 412.836 89.0462C412.836 107.037 425.556 120.303 443.183 120.303ZM493.339 89.0462C493.339 117.94 473.894 138.838 446.999 138.838C433.189 138.838 421.377 132.841 413.562 122.665V177H393.755V42.8887H413.017V55.791C421.013 45.4328 432.825 39.2542 446.999 39.2542C473.713 39.2542 493.339 60.1523 493.339 89.0462Z" fill="black"/>
<path d="M517.684 42.8887H537.31V135.204H517.684V42.8887ZM527.497 27.9874C520.228 27.9874 515.14 22.8992 515.14 15.812C515.14 8.90651 520.228 4 527.497 4C534.584 4 539.672 8.90651 539.672 15.812C539.672 22.8992 534.584 27.9874 527.497 27.9874Z" fill="black"/>
<path d="M84.6908 18.7347L51.3145 76.0553C40.9704 93.8202 53.7858 116.112 74.3428 116.112L94.9836 116.112" stroke="black" strokeWidth="37.2408" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M115.604 134.102L148.981 76.7816C159.325 59.0167 146.509 36.7252 125.952 36.7253L105.311 36.7253" stroke="#09D334" strokeWidth="37.2408" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M115.149 36.7158L74.2261 36.7158" stroke="#09D334" strokeWidth="37.2408" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M85.1435 116.125L126.03 116.123" stroke="black" strokeWidth="37.2408" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

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
