import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPackageBySlug } from '@/lib/data/packages'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  Users,
  Star,
  Check,
  X,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react'

const typeLabels = {
  adventure: { label: 'Aventura', color: 'bg-orange-100 text-orange-700' },
  relax: { label: 'Relax', color: 'bg-blue-100 text-blue-700' },
  cultural: { label: 'Cultural', color: 'bg-purple-100 text-purple-700' },
  family: { label: 'Familiar', color: 'bg-green-100 text-green-700' },
  luxury: { label: 'Lujo', color: 'bg-yellow-100 text-yellow-700' },
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  ARS: '$',
  BRL: 'R$',
  MXN: '$',
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pkg = getPackageBySlug(id)

  if (!pkg) {
    notFound()
  }

  const category = typeLabels[pkg.type]
  const currencySymbol = currencySymbols[pkg.currency] || pkg.currency

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image with Overlay */}
      <div className="relative h-[70vh] overflow-hidden">
        <Image
          src={pkg.coverImage}
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
              <Badge className={`${category.color} shadow-lg`}>{category.label}</Badge>
              {pkg.popular && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
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
                <span className="font-medium">{pkg.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{pkg.duration} días</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">{pkg.groupSize} personas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{pkg.rating} / 5.0</span>
              </div>
            </div>

            {/* Price */}
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
              <p className="text-white/80 text-sm mb-1">Desde</p>
              <p className="text-white text-4xl font-bold">
                {currencySymbol}{pkg.price.toLocaleString()}
                <span className="text-lg font-normal text-white/80 ml-2">por persona</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Sobre este viaje</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Destinos incluidos</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.highlights.map((highlight, idx) => (
                  <Badge key={idx} variant="outline" className="text-base py-2 px-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Galería</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pkg.gallery.map((imageUrl, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${pkg.name} - Image ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center mb-6">
                    <p className="text-white/80 text-sm mb-2">Desde</p>
                    <p className="text-5xl font-bold mb-1">
                      {currencySymbol}{pkg.price.toLocaleString()}
                    </p>
                    <p className="text-white/80">por persona</p>
                  </div>
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold">
                      Reservar Ahora
                    </Button>
                  </Link>
                  <p className="text-xs text-center mt-4 text-white/75">
                    ✓ Sin tarjeta · ✓ Pago flexible · ✓ Cancelación gratuita
                  </p>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duración</p>
                      <p className="font-semibold">{pkg.duration} días</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tamaño del grupo</p>
                      <p className="font-semibold">{pkg.groupSize} personas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-semibold">{pkg.rating} / 5.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Modalidad</p>
                      <p className="font-semibold">Todo incluido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          <Clock className="w-8 h-8 inline mr-2" />
          Itinerario
        </h2>
        <div className="space-y-4">
          {pkg.itinerary.map((day) => (
            <Card key={day.day} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{day.title}</CardTitle>
                    <p className="text-gray-600 mb-4">{day.description}</p>
                    <div className="space-y-1">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Included/Not Included Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Included */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">
                <Check className="w-6 h-6 inline mr-2" />
                Incluido en el paquete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pkg.included.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Not Included */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-orange-700">
                <X className="w-6 h-6 inline mr-2" />
                No incluido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pkg.notIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <X className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
