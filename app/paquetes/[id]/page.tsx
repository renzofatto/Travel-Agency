import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/#paquetes" className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a Paquetes
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge className={category.color}>{category.label}</Badge>
              {pkg.popular && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {pkg.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{pkg.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{pkg.duration} días</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{pkg.groupSize} personas</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{pkg.rating} / 5.0</span>
              </div>
            </div>

            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              {pkg.description}
            </p>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Destinos incluidos:</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.highlights.map((highlight, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Desde</p>
                    <p className="text-4xl font-bold">
                      {currencySymbol}
                      {pkg.price.toLocaleString()}
                    </p>
                    <p className="text-sm opacity-90">por persona</p>
                  </div>
                  <DollarSign className="w-12 h-12 opacity-20" />
                </div>
                <Link href="/auth/register">
                  <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Reservar Ahora
                  </Button>
                </Link>
                <p className="text-xs text-center mt-3 opacity-75">
                  ✓ Sin tarjeta requerida · ✓ Pago flexible · ✓ Cancelación gratuita
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Gallery */}
          <div>
            <div className="grid grid-cols-3 gap-4">
              {pkg.gallery.map((emoji, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-6xl shadow-lg hover:scale-105 transition-transform"
                >
                  {emoji}
                </div>
              ))}
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
