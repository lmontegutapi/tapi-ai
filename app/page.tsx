import Image from 'next/image'
import { ArrowRight, Upload, BarChart3, Zap, PhoneCall, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedBackground } from '@/components/marketing/animated-background'
import bgLoginPage from "@/public/images/bg-login-page.png";
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <AnimatedBackground />
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
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
          <div className="text-xl font-bold text-[hsl(142.4,71.8%,29.2%)]">TapFlow</div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
            </Link>

            <Link href="/register">
              <Button className="bg-[hsl(142.4,71.8%,29.2%)] hover:bg-[hsl(142.4,71.8%,25%)] text-white">
                Empezar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(142.4,71.8%,29.2%)] via-white to-white opacity-20" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
                Listado Refinado para Cobranzas Inteligentes
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Automatiza y optimiza tu proceso de cobranza con inteligencia artificial
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="bg-[hsl(142.4,71.8%,29.2%)] hover:bg-[hsl(142.4,71.8%,25%)] text-white">
                    Empezar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  Ver demo
                </Button>
              </div>
            </div>
            <div className="flex-1 mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(142.4,71.8%,29.2%)] to-blue-500 rounded-xl opacity-10 blur-2xl" />
                <div className="relative bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4">
                  <Image
                    src={bgLoginPage}
                    alt="AI-generated TapFlow Dashboard"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <Upload className="h-10 w-10 mb-4 text-[hsl(142.4,71.8%,29.2%)]" />
              <h3 className="text-xl font-semibold mb-2">Carga de Datos Simplificada</h3>
              <p className="text-gray-600">
                Importa fácilmente tu base de usuarios desde CSV o ingresa manualmente para bases pequeñas
              </p>
            </Card>
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <PhoneCall className="h-10 w-10 mb-4 text-[hsl(142.4,71.8%,29.2%)]" />
              <h3 className="text-xl font-semibold mb-2">Agentes de Voz AI</h3>
              <p className="text-gray-600">
                Utiliza agentes de voz AI para realizar llamadas de cobranza efectivas y personalizadas
              </p>
            </Card>
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="h-10 w-10 mb-4 text-[hsl(142.4,71.8%,29.2%)]" />
              <h3 className="text-xl font-semibold mb-2">Campañas Automatizadas</h3>
              <p className="text-gray-600">
                Configura y programa campañas de cobranza con fechas, horarios y frecuencias optimizadas
              </p>
            </Card>
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <Zap className="h-10 w-10 mb-4 text-[hsl(142.4,71.8%,29.2%)]" />
              <h3 className="text-xl font-semibold mb-2">Gestión de Pagos</h3>
              <p className="text-gray-600">
                Facilita el proceso de pago para tus clientes con opciones integradas y seguras
              </p>
            </Card>
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <BarChart3 className="h-10 w-10 mb-4 text-[hsl(142.4,71.8%,29.2%)]" />
              <h3 className="text-xl font-semibold mb-2">Análisis en Tiempo Real</h3>
              <p className="text-gray-600">
                Monitorea el progreso y efectividad de tus campañas con métricas detalladas en tu dashboard
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tu Dashboard Intuitivo
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Gestiona tus campañas, visualiza resultados y toma decisiones informadas con nuestro potente dashboard
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(142.4,71.8%,29.2%)] to-blue-500 rounded-xl opacity-10 blur-2xl" />
            <div className="relative bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4">
              <Image
                src={bgLoginPage}
                alt="Dashboard Preview"
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Comienza a Optimizar tu Cobranza Hoy
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Únete a las empresas que ya están transformando su proceso de cobranza con TapFlow
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[hsl(142.4,71.8%,29.2%)] hover:bg-[hsl(142.4,71.8%,25%)] text-white">
                Empezar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © 2024 TapFlow. Todos los derechos reservados.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Términos
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

