import Image from "next/image";
import {
  ArrowRight,
  Phone,
  BarChart3,
  Calendar,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/marketing/grid-background";
import { LightBeam } from "@/components/marketing/light-beam";
import Link from "next/link";
import bgLoginPage from "@/public/images/bg-login-page.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <GridBackground />
      <LightBeam />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-gray-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent flex items-center gap-4">
            <div>
              <svg
                width="30"
                height="30"
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
            <div className="grid flex-1 text-left text-lg leading-tight">
              Tapi
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Empezar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent leading-tight">
              Automatiza tu Cobranza
              <br />
              con Inteligencia Artificial
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
              Optimiza tus procesos de cobranza con agentes de voz AI y gestión
              inteligente de pagos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/*               <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Ver Demo
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Phone,
                title: "Agentes de Voz AI",
                description:
                  "Realiza llamadas automatizadas con voces naturales y personalizadas",
              },
              {
                icon: Calendar,
                title: "Campañas Inteligentes",
                description:
                  "Programa y optimiza tus campañas de cobranza con IA",
              },
              {
                icon: BarChart3,
                title: "Analytics Avanzado",
                description:
                  "Visualiza y analiza el rendimiento de tus campañas en tiempo real",
              },
              {
                icon: Shield,
                title: "Seguridad Garantizada",
                description:
                  "Protección de datos y cumplimiento normativo integrado",
              },
              {
                icon: Zap,
                title: "Automatización Total",
                description:
                  "Reduce tareas manuales y mejora la eficiencia operativa",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group p-6 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <feature.icon className="h-10 w-10 mb-4 text-emerald-400" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl opacity-20 blur-3xl" />
            <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-2">
                <Image
                  src={bgLoginPage.src}
                  width={1200}
                  height={600}
                  alt="Tapi Dashboard"
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Transforma tu Proceso de Cobranza
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Únete a las empresas que ya están optimizando sus operaciones con
              Tapi
            </p>
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/40 text-sm">
              © 2024 Tapi. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors"
              >
                Términos
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors"
              >
                Privacidad
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
