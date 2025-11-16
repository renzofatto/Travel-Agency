import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PackagesSection from '@/components/packages/packages-section'
import LandingNavbar from '@/components/layout/landing-navbar'
import InfiniteDestinationsScroll from '@/components/infinite-destinations-scroll'
import { createClient } from '@/lib/supabase/server'
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

// Configuración de caché para ISR (Incremental Static Regeneration)
// La página se regenerará cada 3600 segundos (1 hora) automáticamente
// También se regenera cuando se llama a revalidatePath('/') desde las acciones
export const revalidate = 3600

export default async function HomePage() {
  // Fetch featured packages - Next.js cacheará automáticamente este fetch
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    userProfile = { ...user, ...profile }
  }

  // Fetch packages for infinite scroll section
  const { data: scrollPackages } = await supabase
    .from('travel_packages')
    .select(`
      id,
      name,
      description,
      destination,
      duration_days,
      cover_image,
      price_estimate,
      category,
      short_description,
      continent,
      gradient_colors
    `)
    .eq('show_in_scroll', true)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Fetch packages for featured/hero sections
  const { data: packages } = await supabase
    .from('travel_packages')
    .select(`
      id,
      name,
      description,
      destination,
      duration_days,
      cover_image,
      price_estimate,
      category,
      package_itinerary_items (
        id,
        title,
        description,
        day_number,
        category,
        show_in_landing
      )
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch packages for hero section
  const { data: heroPackages } = await supabase
    .from('travel_packages')
    .select(`
      id,
      name,
      destination,
      cover_image,
      price_estimate,
      short_description
    `)
    .eq('show_in_hero', true)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(4) // Show max 4 in hero collage
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Floating particles background */}
      <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-[10%] w-2 h-2 bg-blue-400/30 rounded-full animate-float-slow" />
        <div className="absolute top-20 left-[30%] w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-medium" />
        <div className="absolute top-14 left-[50%] w-2.5 h-2.5 bg-pink-400/30 rounded-full animate-float-fast" />
        <div className="absolute top-8 left-[70%] w-1 h-1 bg-indigo-400/30 rounded-full animate-float-slow" />
        <div className="absolute top-16 left-[85%] w-2 h-2 bg-cyan-400/30 rounded-full animate-float-medium" />
      </div>

      {/* Header - Dynamic Navbar */}
      <LandingNavbar user={userProfile} />

      {/* Hero Section with Background */}
      <section className="relative h-screen flex items-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
            alt="Travel Adventure"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Tu Agencia de Viajes de Confianza
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">
                Viaja sin límites
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  con expertos en turismo
                </span>
              </h1>
              <p className="text-xl text-white/95 mb-8 leading-relaxed drop-shadow-lg">
                Somos tu agencia de viajes especializada en grupos. Diseñamos experiencias únicas
                y nos encargamos de cada detalle: desde vuelos y hoteles hasta actividades
                y asistencia 24/7. ¡Vos solo preocupate por disfrutar!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:scale-105 transition-transform"
                  >
                    <Plane className="w-5 h-5 mr-2" />
                    Comenzar mi Viaje
                  </Button>
                </Link>
                <a href="#paquetes">
                  <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/30">
                    Ver Paquetes
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-8 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>Cancelación gratis</span>
                </div>
              </div>
            </div>

            {/* Destination Collage - Dynamic from Supabase */}
            {heroPackages && heroPackages.length > 0 && (
              <div className="relative hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                {heroPackages.map((pkg, index) => {
                  const cityName = pkg.destination.split(',')[0]?.trim() || pkg.destination
                  const isEven = index % 2 === 0
                  const colorClass = ['blue', 'purple', 'pink', 'cyan'][index % 4]

                  return (
                    <Link
                      key={pkg.id}
                      href={`/paquetes/${pkg.id}`}
                      className={`relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-${colorClass}-500/50 transition-all duration-500 hover:scale-105 ${!isEven ? 'mt-8' : ''} block`}
                    >
                      <Image
                        src={pkg.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'}
                        alt={cityName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 1024px) 100vw, 400px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className={`absolute inset-0 bg-gradient-to-t from-${colorClass}-900/60 via-${colorClass}-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className={`w-4 h-4 text-${colorClass}-400`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{cityName}</h3>
                        <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {pkg.short_description || pkg.destination}
                        </p>
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                          <span className="text-white/90 text-sm font-semibold">Desde ${pkg.price_estimate}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-3 hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5 text-[var(--color-brand-ocean)]" />
                  <span className="font-bold text-[var(--color-brand-navy)]">50+ Destinos</span>
                  <div className="w-2 h-2 bg-[var(--color-brand-ocean)] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Infinite Destinations Scroll Section */}
      <InfiniteDestinationsScroll packages={scrollPackages || []} />

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
          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
                alt="Paquetes Personalizados"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Paquetes Personalizados</CardTitle>
              <CardDescription className="text-base">
                Diseñamos el itinerario perfecto según tus intereses, presupuesto y fechas.
                Cada viaje es único.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
                alt="Reservas & Alojamiento"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Hotel className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Reservas & Alojamiento</CardTitle>
              <CardDescription className="text-base">
                Gestionamos todas tus reservas: hoteles, hostels, vuelos, traslados y actividades.
                Sin complicaciones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80"
                alt="Asistencia 24/7"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Asistencia 24/7</CardTitle>
              <CardDescription className="text-base">
                Soporte continuo durante todo tu viaje. Cambios de planes, emergencias o
                consultas, estamos para ayudarte.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80"
                alt="Viajes Grupales"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Viajes Grupales</CardTitle>
              <CardDescription className="text-base">
                Especialistas en grupos grandes. Coordinamos actividades, transporte y
                alojamiento para todos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80"
                alt="Mejores Precios"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Mejores Precios</CardTitle>
              <CardDescription className="text-base">
                Alianzas con proveedores globales nos permiten ofrecerte tarifas exclusivas y
                promociones especiales.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-xl transition-all group border-0 overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80"
                alt="Destinos Increíbles"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardHeader>
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
      <PackagesSection packages={packages || []} />

      {/* Destination Showcase Divider */}
      <section className="relative h-[60vh] my-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&q=80"
          alt="Destinos del Mundo"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
              El mundo te está esperando
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-lg">
              Miles de destinos, infinitas experiencias. Tu próxima aventura comienza aquí.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-10 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 mr-2" />
                Explorar Destinos
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

        {/* Platform Preview Image */}
        <div className="mb-16 relative">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80"
              alt="Plataforma TravelHub"
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Dashboard intuitivo y fácil de usar</h3>
              <p className="text-lg opacity-90">Gestiona todos los aspectos de tu viaje desde una sola plataforma</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Gestión de Grupos"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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

          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100">
              <Image
                src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80"
                alt="Itinerario Colaborativo"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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

          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
              <Image
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
                alt="División de Gastos"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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

          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
              <Image
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
                alt="Documentos Centralizados"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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

          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100">
              <Image
                src="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80"
                alt="Galería Compartida"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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

          <Card className="hover:shadow-lg transition-all group border-0 overflow-hidden">
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Acceso 24/7"
                fill
                className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
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
          <Card className="border-0 overflow-hidden group">
            <div className="relative h-56 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80"
                alt="Bariloche"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="pt-6 bg-white">
              <p className="text-gray-700 mb-4 italic">
                &quot;Organizar nuestro viaje de egresados fue super fácil con TravelHub. La
                plataforma nos permitió coordinar todo entre 30 personas sin caos.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  MC
                </div>
                <div>
                  <p className="font-semibold">María Castro</p>
                  <p className="text-sm text-gray-600">Viaje de Egresados - Bariloche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 overflow-hidden group">
            <div className="relative h-56 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80"
                alt="Europa"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="pt-6 bg-white">
              <p className="text-gray-700 mb-4 italic">
                &quot;El sistema de gastos es genial! Pudimos llevar cuenta de todo lo que gastábamos
                y al final sabíamos exactamente quién debía qué. Cero conflictos.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  JR
                </div>
                <div>
                  <p className="font-semibold">Juan Rodríguez</p>
                  <p className="text-sm text-gray-600">Viaje Familiar - Europa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 overflow-hidden group">
            <div className="relative h-56 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80"
                alt="Caribe"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <CardContent className="pt-6 bg-white">
              <p className="text-gray-700 mb-4 italic">
                &quot;La atención de la agencia fue impecable. Nos resolvieron un problema con el hotel
                a las 2am y la plataforma nos permitió tener toda la info a mano.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
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
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
              alt="Comienza tu aventura"
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/85 to-purple-900/90" />
          </div>

          {/* Content */}
          <div className="relative z-10 pt-20 pb-20 px-6">
            <Badge className="mb-6 bg-white/20 backdrop-blur-md text-white border-white/30 text-base px-6 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Comienza tu Aventura Hoy
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
              Tu próxima aventura comienza aquí
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              Únete a cientos de viajeros que ya organizan sus viajes de forma simple y
              profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="text-lg px-10 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-transform"
                >
                  <Plane className="w-5 h-5 mr-2" />
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/30"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Configuración en 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
