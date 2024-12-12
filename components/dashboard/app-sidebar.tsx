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
      /* items: [
        {
          title: "General",
          url: "/dashboard",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        }
      ], */
    },
    {
      title: "Cobranzas",
      url: "/dashboard/receivables",
      icon: DollarSign,
      items: [
        {
          title: "Deudas",
          url: "/dashboard/receivables",
        },
        {
          title: "Subir Archivo",
          url: "/dashboard/receivables/upload",
        },
/*         {
          title: "Historial",
          url: "/dashboard/receivables/history",
        } */
      ],
    },
    {
      title: "Campañas",
      url: "/dashboard/campaigns",
      icon: Phone,
      /* items: [
        {
          title: "Activas",
          url: "/dashboard/campaigns",
        },
        {
          title: "Nueva Campaña",
          url: "/dashboard/campaigns/new",
        },
        {
          title: "Resultados",
          url: "/dashboard/campaigns/results",
        }
      ], */
    },
    {
      title: "Agentes AI",
      url: "/dashboard/ai-agents",
      icon: Bot,
      /* items: [
        {
          title: "Mis Agentes",
          url: "/dashboard/ai-agents",
        },
        {
          title: "Crear Agente",
          url: "/dashboard/ai-agents/new",
        },
        {
          title: "Scripts",
          url: "/dashboard/ai-agents/scripts",
        }
      ], */
    },
    /* {
      title: "Reportes",
      url: "/dashboard/reports",
      icon: BarChart,
      items: [
        {
          title: "Resumen",
          url: "/dashboard/reports",
        },
        {
          title: "Campañas",
          url: "/dashboard/reports/campaigns",
        },
        {
          title: "Cobranzas",
          url: "/dashboard/reports/collection",
        },
        {
          title: "Rendimiento",
          url: "/dashboard/reports/performance",
        }
      ],
    }, */
    {
      title: "Configuración",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/dashboard/settings",
        },
        {
          title: "Organización",
          url: "/dashboard/settings/organization",
        },
        {
          title: "Equipo",
          url: "/dashboard/settings/team",
        },
/*         {
          title: "Integraciones",
          url: "/dashboard/settings/integrations",
        } */
      ],
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
              <a href="#">
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
                  <span className="truncate font-semibold uppercase">
                    TapFlow
                  </span>
                  <span className="truncate text-xs">AI-powered</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
