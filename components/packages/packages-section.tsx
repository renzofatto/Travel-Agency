'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Search,
  Plane,
  Star,
  Clock,
} from 'lucide-react'
import { packages } from '@/lib/data/packages'

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

export default function PackagesSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContinent, setSelectedContinent] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesContinent =
      selectedContinent === 'all' || pkg.continent === selectedContinent

    const matchesType = selectedType === 'all' || pkg.type === selectedType

    return matchesSearch && matchesContinent && matchesType
  })

  const continents = [
    { value: 'all', label: 'Todos los destinos' },
    { value: 'Americas', label: 'América' },
    { value: 'Europe', label: 'Europa' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Africa', label: 'África' },
    { value: 'Oceania', label: 'Oceanía' },
  ]

  return (
    <section id="paquetes" className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-green-100 text-green-700">
          <Plane className="w-3 h-3 mr-1" />
          Paquetes de Viaje
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Explora nuestros
          <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {' '}
            destinos increíbles
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Paquetes todo incluido diseñados para grupos. Encuentra tu próxima aventura.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por destino, país o actividad..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Select value={selectedContinent} onValueChange={setSelectedContinent}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Continente" />
          </SelectTrigger>
          <SelectContent>
            {continents.map((continent) => (
              <SelectItem key={continent.value} value={continent.value}>
                {continent.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo de viaje" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="adventure">🏔️ Aventura</SelectItem>
            <SelectItem value="relax">🏖️ Relax</SelectItem>
            <SelectItem value="cultural">🏛️ Cultural</SelectItem>
            <SelectItem value="family">👨‍👩‍👧‍👦 Familiar</SelectItem>
            <SelectItem value="luxury">💎 Lujo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Mostrando <span className="font-semibold">{filteredPackages.length}</span> paquete
        {filteredPackages.length !== 1 && 's'}
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const category = typeLabels[pkg.type]
          const currencySymbol = currencySymbols[pkg.currency] || pkg.currency

          return (
            <Card
              key={pkg.id}
              className="hover:shadow-xl transition-all group cursor-pointer overflow-hidden"
            >
              <CardHeader className="relative">
                {pkg.popular && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {pkg.image}
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {pkg.name}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{pkg.country}</span>
                  </div>
                  <Badge className={category.color}>{category.label}</Badge>
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Highlights */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Incluye:</p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.highlights.slice(0, 4).map((highlight, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{pkg.duration} días</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{pkg.groupSize} pax</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{pkg.rating} / 5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Todo incluido</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Desde</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currencySymbol}
                      {pkg.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">por persona</p>
                  </div>
                  <Link href={`/paquetes/${pkg.slug}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            No encontramos paquetes que coincidan con tu búsqueda
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedContinent('all')
              setSelectedType('all')
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </section>
  )
}
