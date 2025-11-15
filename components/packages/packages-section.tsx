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
import Image from 'next/image'
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
// import { packages } from '@/lib/data/packages'

interface PackageWithItinerary {
  id: string
  name: string
  description: string | null
  destination: string
  duration_days: number
  cover_image: string | null
  price_estimate: number | null
  difficulty_level: string | null
  package_itinerary_items: Array<{
    id: string
    title: string
    description: string | null
    day_number: number
    category: string
    show_in_landing: boolean
  }>
}

interface PackagesSectionProps {
  packages: PackageWithItinerary[]
}

const difficultyLabels = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderado', color: 'bg-orange-100 text-orange-700' },
  challenging: { label: 'Desafiante', color: 'bg-red-100 text-red-700' },
}

export default function PackagesSection({ packages }: PackagesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

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
              placeholder="Buscar por destino o descripción..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Mostrando <span className="font-semibold">{filteredPackages.length}</span> paquete
        {filteredPackages.length !== 1 && 's'}
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          // Get difficulty badge (if available)
          const difficultyInfo = pkg.difficulty_level
            ? difficultyLabels[pkg.difficulty_level as keyof typeof difficultyLabels]
            : null

          // Get highlights from itinerary items that should be shown on landing
          const landingActivities = pkg.package_itinerary_items
            .filter((item) => item.show_in_landing)
            .slice(0, 4)

          // Default cover image if none provided
          const coverImage = pkg.cover_image || '/images/default-package.jpg'

          return (
            <Card
              key={pkg.id}
              className="hover:shadow-2xl transition-all group cursor-pointer overflow-hidden border-0"
            >
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={coverImage}
                  alt={pkg.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Badges on Image */}
                {difficultyInfo && (
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge className={`${difficultyInfo.color} shadow-lg`}>
                      {difficultyInfo.label}
                    </Badge>
                  </div>
                )}

                {/* Title on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <CardTitle className="text-2xl text-white mb-2 drop-shadow-lg">
                    {pkg.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{pkg.destination}</span>
                  </div>
                </div>
              </div>

              <CardHeader className="relative pt-4 pb-2">
                {/* Description */}
                {pkg.description && (
                  <CardDescription className="line-clamp-2 mb-3">
                    {pkg.description}
                  </CardDescription>
                )}

                {/* Activity Highlights */}
                {landingActivities.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Actividades incluidas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {landingActivities.map((activity) => (
                        <Badge key={activity.id} variant="outline" className="text-xs font-normal">
                          {activity.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{pkg.duration_days} días</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Todo incluido</span>
                  </div>
                </div>

                {/* Price */}
                {pkg.price_estimate && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Desde</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${pkg.price_estimate.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">precio estimado</p>
                    </div>
                    <Link href={`/paquetes/${pkg.id}`}>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Ver más
                      </Button>
                    </Link>
                  </div>
                )}
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
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Limpiar búsqueda
          </Button>
        </div>
      )}
    </section>
  )
}
