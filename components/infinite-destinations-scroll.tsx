'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Package {
  id: string
  name: string
  destination: string
  duration_days: number
  price_estimate: number
  cover_image: string
  category: string
  short_description?: string
  continent?: string
  gradient_colors?: string
}

interface Destination {
  id: string
  name: string
  image: string
  price: number
  duration: string
  description: string
  continent: string
  color: string
  packageId: string
}

interface InfiniteDestinationsScrollProps {
  packages?: Package[]
}

// Helper to parse destination into city and country
function parseDestination(destination: string): { city: string; country: string } {
  const parts = destination.split(',').map(s => s.trim())
  if (parts.length >= 2) {
    return { city: parts[0], country: parts.slice(1).join(', ') }
  }
  return { city: destination, country: '' }
}

function DestinationCard({
  destination,
  index
}: {
  destination: Destination
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  })

  // Alternar entre izquierda y derecha
  const fromLeft = index % 2 === 0

  // Animación de entrada desde los lados
  const x = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    fromLeft ? [-200, 0, 0, 200] : [200, 0, 0, -200]
  )

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  )

  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.8, 1, 1, 0.8]
  )

  const href = `/paquetes/${destination.packageId}`

  return (
    <motion.div
      ref={cardRef}
      style={{ x, opacity, scale }}
      className="mb-32"
    >
      <Link
        href={href}
        className="group block"
      >
        <div className={`
          relative overflow-hidden rounded-3xl shadow-2xl
          transition-all duration-500
          hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
          hover:scale-[1.02]
          ${fromLeft ? 'ml-0 mr-auto' : 'ml-auto mr-0'}
          max-w-5xl
        `}>
          {/* Background Image */}
          <div className="relative h-[500px] overflow-hidden">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className={`absolute inset-0 bg-gradient-to-br ${destination.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            {/* Continent Badge */}
            {destination.continent && (
              <div className="mb-4">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-sm px-4 py-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {destination.continent}
                </Badge>
              </div>
            )}

            {/* Destination Name */}
            <h3 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-2xl">
              {destination.name}
            </h3>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-2xl leading-relaxed drop-shadow-lg">
              {destination.description}
            </p>

            {/* Info Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm opacity-80">Desde</span>
                  <span className="text-2xl font-bold">${destination.price}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-semibold">{destination.duration}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${destination.color} text-white border-0 shadow-2xl text-lg px-8`}
              >
                Ver Paquete Completo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Decorative Corner */}
          <div className={`absolute top-6 right-6 w-20 h-20 bg-gradient-to-br ${destination.color} rounded-full opacity-50 blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500`} />
        </div>
      </Link>
    </motion.div>
  )
}

export default function InfiniteDestinationsScroll({ packages = [] }: InfiniteDestinationsScrollProps) {
  const containerRef = useRef<HTMLElement>(null)

  // Transform packages from Supabase into display format
  const destinations: Destination[] = packages.map(pkg => {
    const { city } = parseDestination(pkg.destination)

    return {
      id: pkg.id,
      name: city,
      packageId: pkg.id,
      image: pkg.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // Fallback image
      price: pkg.price_estimate,
      duration: `${pkg.duration_days} ${pkg.duration_days === 1 ? 'día' : 'días'}`,
      description: pkg.short_description || pkg.destination,
      continent: pkg.continent || '',
      color: pkg.gradient_colors || 'from-blue-500 to-indigo-600',
    }
  })

  // Don't render if no destinations
  if (destinations.length === 0) {
    return null
  }

  return (
    <section
      ref={containerRef}
      className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 text-base px-6 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Explora el Mundo
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Descubre tu próximo
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {' '}
                destino
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Desplázate para explorar nuestros destinos más populares.
              Cada uno diseñado para crear recuerdos inolvidables.
            </p>
          </motion.div>
        </div>

        {/* Destinations Cards */}
        <div className="relative">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              index={index}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-lg text-gray-600 mb-6">
            ¿No encontraste lo que buscabas?
          </p>
          <Link href="#paquetes">
            <Button size="lg" className="text-lg px-10">
              Ver Todos los Paquetes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
