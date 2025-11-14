import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PackagesSection from '@/components/packages/packages-section'
import {
  Plane,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  Globe,
  Shield,
  Star,
  CheckCircle2,
  MapPin,
  Hotel,
  Compass,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TravelHub
              </span>
              <p className="text-xs text-gray-600">Tu Agencia de Viajes Digital</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#servicios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </a>
            <a href="#paquetes" className="text-gray-700 hover:text-blue-600 transition-colors">
              Paquetes
            </a>
            <a href="#plataforma" className="text-gray-700 hover:text-blue-600 transition-colors">
              Plataforma
            </a>
            <a href="#testimonios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Testimonios
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden sm:flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Tu Agencia de Viajes de Confianza
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Viaja sin límites
              </span>
              <br />
              <span className="text-gray-900">con expertos en turismo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Somos tu agencia de viajes especializada en grupos. Diseñamos experiencias únicas
              y nos encargamos de cada detalle: desde vuelos y hoteles hasta actividades
              y asistencia 24/7. ¡Vos solo preocupate por disfrutar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Plane className="w-5 h-5 mr-2" />
                  Comenzar mi Viaje
                </Button>
              </Link>
              <a href="#paquetes">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Paquetes
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Cancelación gratis</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Stats */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-2xl">
                <CardContent className="pt-6">
                  <Users className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-4xl font-bold mb-1">500+</p>
                  <p className="text-sm opacity-90">Viajeros Felices</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-2xl mt-8">
                <CardContent className="pt-6">
                  <Globe className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-4xl font-bold mb-1">50+</p>
                  <p className="text-sm opacity-90">Destinos</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-2xl">
                <CardContent className="pt-6">
                  <Star className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-4xl font-bold mb-1">4.9</p>
                  <p className="text-sm opacity-90">Rating Promedio</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-2xl mt-8">
                <CardContent className="pt-6">
                  <TrendingUp className="w-10 h-10 mb-3 opacity-80" />
                  <p className="text-4xl font-bold mb-1">95%</p>
                  <p className="text-sm opacity-90">Recomendación</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Services Section */}
      <section id="servicios" className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            <Compass className="w-3 h-3 mr-1" />
            Servicios de Agencia
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Organizamos tu viaje de
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}
              principio a fin
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nos encargamos de todos los detalles para que solo te preocupes por disfrutar
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Paquetes Personalizados</CardTitle>
              <CardDescription className="text-base">
                Diseñamos el itinerario perfecto según tus intereses, presupuesto y fechas.
                Cada viaje es único.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-purple-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Hotel className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Reservas & Alojamiento</CardTitle>
              <CardDescription className="text-base">
                Gestionamos todas tus reservas: hoteles, hostels, vuelos, traslados y actividades.
                Sin complicaciones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-green-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Asistencia 24/7</CardTitle>
              <CardDescription className="text-base">
                Soporte continuo durante todo tu viaje. Cambios de planes, emergencias o
                consultas, estamos para ayudarte.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-orange-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Viajes Grupales</CardTitle>
              <CardDescription className="text-base">
                Especialistas en grupos grandes. Coordinamos actividades, transporte y
                alojamiento para todos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-indigo-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Mejores Precios</CardTitle>
              <CardDescription className="text-base">
                Alianzas con proveedores globales nos permiten ofrecerte tarifas exclusivas y
                promociones especiales.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-2 hover:border-teal-200">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Destinos Increíbles</CardTitle>
              <CardDescription className="text-base">
                Desde playas paradisíacas hasta ciudades históricas. Europa, Asia, América y
                más. El mundo te espera.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Travel Packages Section */}
      <PackagesSection />

      {/* Platform Features Section */}
      <section id="plataforma" className="container mx-auto px-4 py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Beneficio Exclusivo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Además, acceso a nuestra
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}
              app de gestión
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Como plus, te damos acceso a nuestra plataforma digital para que coordines mejor con tu grupo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>👥 Gestión de Grupos</CardTitle>
              <CardDescription>
                Crea grupos de viaje con amigos, familia o desconocidos.
                Asigna líderes y administra miembros fácilmente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>📅 Itinerario Colaborativo</CardTitle>
              <CardDescription>
                Planifica actividades día a día con horarios, ubicaciones y categorías.
                Reorganiza tu agenda al instante.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>💰 División de Gastos</CardTitle>
              <CardDescription>
                Sistema tipo Splitwise integrado. Registra gastos, divide entre miembros
                y ve quién debe a quién. 3 tipos de división.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>📄 Documentos Centralizados</CardTitle>
              <CardDescription>
                Guarda pasajes, reservas de hotel, tickets de actividades y más.
                Todo en un solo lugar accesible para el grupo.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>📸 Galería Compartida</CardTitle>
              <CardDescription>
                Todos los miembros pueden subir fotos del viaje.
                Comenta y revive los mejores momentos juntos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>⏰ Acceso 24/7</CardTitle>
              <CardDescription>
                Tu viaje siempre disponible desde cualquier dispositivo.
                Sincronización en tiempo real para todo el grupo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-100 text-yellow-700">
            <Star className="w-3 h-3 mr-1" />
            Testimonios
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Lo que dicen nuestros
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {' '}
              viajeros
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Organizar nuestro viaje de egresados fue super fácil con TravelHub. La
                plataforma nos permitió coordinar todo entre 30 personas sin caos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <p className="font-semibold">María Castro</p>
                  <p className="text-sm text-gray-600">Viaje de Egresados - Bariloche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "El sistema de gastos es genial! Pudimos llevar cuenta de todo lo que gastábamos
                y al final sabíamos exactamente quién debía qué. Cero conflictos."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  JR
                </div>
                <div>
                  <p className="font-semibold">Juan Rodríguez</p>
                  <p className="text-sm text-gray-600">Viaje Familiar - Europa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "La atención de la agencia fue impecable. Nos resolvieron un problema con el hotel
                a las 2am y la plataforma nos permitió tener toda la info a mano."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  LP
                </div>
                <div>
                  <p className="font-semibold">Laura Pérez</p>
                  <p className="text-sm text-gray-600">Viaje de Amigas - Caribe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tu próxima aventura comienza aquí
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Únete a cientos de viajeros que ya organizan sus viajes de forma simple y
              profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-10 shadow-xl hover:scale-105 transition-transform"
                >
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 bg-white/10 hover:bg-white/20 text-white border-white"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
            <p className="text-sm mt-6 opacity-75">
              ✓ Sin tarjeta requerida · ✓ Configuración en 2 minutos · ✓ Soporte 24/7
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Plane className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TravelHub
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Tu agencia de viajes digital. Organizamos experiencias inolvidables.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Servicios</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Paquetes Personalizados</li>
                <li>Viajes Grupales</li>
                <li>Reservas & Hoteles</li>
                <li>Asistencia 24/7</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Gestión de Grupos</li>
                <li>Itinerarios</li>
                <li>Control de Gastos</li>
                <li>Documentos</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Contacto</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>info@travelhub.com</li>
                <li>+54 11 1234-5678</li>
                <li>Lun-Vie 9:00-18:00</li>
                <li>Asistencia 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-gray-600">
            <p>© 2024 TravelHub. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con ❤️ para viajeros como vos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
