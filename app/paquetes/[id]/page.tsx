import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RouteMap from '@/components/packages/route-map'
import {
  ArrowLeft,
  Calendar,
  Users,
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
} from 'lucide-react'

const difficultyLabels = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderado', color: 'bg-orange-100 text-orange-700' },
  challenging: { label: 'Desafiante', color: 'bg-red-100 text-red-700' },
}

const categoryEmojis: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📌',
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch package with itinerary items
  const { data: pkg, error } = await supabase
    .from('travel_packages')
    .select(`
      id,
      name,
      description,
      destination,
      duration_days,
      cover_image,
      price_estimate,
      difficulty_level,
      is_featured,
      package_itinerary_items (
        id,
        title,
        description,
        day_number,
        start_time,
        end_time,
        location,
        latitude,
        longitude,
        image_url,
        category,
        order_index
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !pkg) {
    notFound()
  }

  // Group itinerary items by day
  const itemsByDay: Record<number, typeof pkg.package_itinerary_items> = {}
  pkg.package_itinerary_items
    .sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
    .forEach((item) => {
      if (!itemsByDay[item.day_number]) {
        itemsByDay[item.day_number] = []
      }
      itemsByDay[item.day_number].push(item)
    })

  const difficultyInfo = pkg.difficulty_level
    ? difficultyLabels[pkg.difficulty_level as keyof typeof difficultyLabels]
    : null

  const coverImage = pkg.cover_image || '/images/default-package.jpg'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Image with Overlay */}
      <div className="relative h-[70vh] overflow-hidden">
        <Image
          src={coverImage}
          alt={pkg.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/#paquetes">
            <Button variant="secondary" className="gap-2 bg-white/90 backdrop-blur-sm hover:bg-white">
              <ArrowLeft className="w-4 h-4" />
              Volver a Paquetes
            </Button>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-16">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              {difficultyInfo && (
                <Badge className={`${difficultyInfo.color} shadow-lg`}>
                  {difficultyInfo.label}
                </Badge>
              )}
              {pkg.is_featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              {pkg.name}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-white/90 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{pkg.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{pkg.duration_days} días</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Todo incluido</span>
              </div>
            </div>

            {/* Price */}
            {pkg.price_estimate && (
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
                <p className="text-white/80 text-sm mb-1">Desde</p>
                <p className="text-white text-4xl font-bold">
                  ${pkg.price_estimate.toLocaleString()}
                  <span className="text-lg font-normal text-white/80 ml-2">precio estimado</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {pkg.description && (
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Sobre este viaje</h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Quick Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Información del Paquete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duración</p>
                      <p className="font-semibold text-lg">{pkg.duration_days} días</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className="font-semibold text-lg">Todo incluido</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itinerary */}
            {Object.keys(itemsByDay).length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Itinerario Día a Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.keys(itemsByDay)
                      .map(Number)
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <div key={day} className="border-l-4 border-blue-600 pl-6 pb-6 last:pb-0">
                          <div className="flex items-center gap-3 mb-4 -ml-9">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                              {day}
                            </div>
                            <h3 className="text-xl font-semibold">Día {day}</h3>
                          </div>

                          <div className="space-y-4">
                            {itemsByDay[day].map((item) => (
                              <div
                                key={item.id}
                                className="bg-white rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
                              >
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Image side */}
                                  {item.image_url && (
                                    <div className="relative h-48 md:h-full min-h-[200px]">
                                      <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                      />
                                    </div>
                                  )}

                                  {/* Content side */}
                                  <div className={`p-4 flex items-start gap-3 ${!item.image_url ? 'md:col-span-2' : ''}`}>
                                    <span className="text-3xl flex-shrink-0">{categoryEmojis[item.category]}</span>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                                      {item.description && (
                                        <p className="text-gray-600 text-sm mb-2">
                                          {item.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                        {item.start_time && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                              {item.start_time}
                                              {item.end_time && ` - ${item.end_time}`}
                                            </span>
                                          </div>
                                        )}
                                        {item.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{item.location}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Route Map */}
            {pkg.package_itinerary_items.some((item) => item.latitude && item.longitude) && (
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  Mapa de la Ruta
                </h2>
                <RouteMap items={pkg.package_itinerary_items} />
              </div>
            )}

            {/* What's Included */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ¿Qué incluye?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Alojamiento</p>
                      <p className="text-sm text-gray-600">Hoteles seleccionados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Transporte</p>
                      <p className="text-sm text-gray-600">Traslados incluidos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Actividades</p>
                      <p className="text-sm text-gray-600">Según itinerario</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Asistencia</p>
                      <p className="text-sm text-gray-600">Soporte 24/7</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Precio del Paquete
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {pkg.price_estimate ? (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">Desde</p>
                        <p className="text-5xl font-bold text-blue-600 mb-2">
                          ${pkg.price_estimate.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">precio estimado por persona</p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duración</span>
                          <span className="font-semibold">{pkg.duration_days} días</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Destino</span>
                          <span className="font-semibold">{pkg.destination}</span>
                        </div>
                        {difficultyInfo && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Dificultad</span>
                            <Badge className={difficultyInfo.color}>
                              {difficultyInfo.label}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <Link href="/auth/register" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6">
                          Reservar Este Paquete
                        </Button>
                      </Link>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        *El precio final puede variar según fechas y disponibilidad
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">Precio</p>
                        <p className="text-2xl font-bold text-gray-800 mb-2">
                          Consultar disponibilidad
                        </p>
                      </div>

                      <Link href="/auth/register" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6">
                          Solicitar Información
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    ¿Necesitas ayuda?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Nuestros expertos están listos para ayudarte a personalizar este paquete
                    según tus necesidades.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Asesoramiento personalizado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Modificaciones sin cargo</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Respuesta en 24 horas</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Contactar a un Experto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para esta aventura?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Reservá tu lugar ahora. Cupos limitados para {pkg.name}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-10">
                  Reservar Ahora
                </Button>
              </Link>
              <Link href="/#paquetes">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 bg-white/10 hover:bg-white/20 text-white border-white"
                >
                  Ver Más Paquetes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
