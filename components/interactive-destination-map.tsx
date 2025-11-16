'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, MapPin, Clock, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Destination {
  id: string
  name: string
  country: string
  continent: string
  x: number // Posición en % del ancho
  y: number // Posición en % del alto
  price: number
  duration: string
  color: string
  description: string
  packageId?: string
}

const destinations: Destination[] = [
  {
    id: 'paris',
    name: 'París',
    country: 'Francia',
    continent: 'Europa',
    x: 48,
    y: 25,
    price: 1200,
    duration: '7 días',
    color: 'from-blue-500 to-indigo-600',
    description: 'Ciudad del amor y la luz',
  },
  {
    id: 'tokyo',
    name: 'Tokio',
    country: 'Japón',
    continent: 'Asia',
    x: 85,
    y: 30,
    price: 1400,
    duration: '8 días',
    color: 'from-pink-500 to-red-600',
    description: 'Tradición y modernidad',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    continent: 'Asia',
    x: 75,
    y: 55,
    price: 950,
    duration: '10 días',
    color: 'from-purple-500 to-pink-600',
    description: 'Paraíso tropical',
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Grecia',
    continent: 'Europa',
    x: 52,
    y: 35,
    price: 1100,
    duration: '6 días',
    color: 'from-cyan-500 to-blue-600',
    description: 'Islas griegas de ensueño',
  },
  {
    id: 'nyc',
    name: 'Nueva York',
    country: 'USA',
    continent: 'América',
    x: 25,
    y: 28,
    price: 1350,
    duration: '7 días',
    color: 'from-yellow-500 to-orange-600',
    description: 'La ciudad que nunca duerme',
  },
  {
    id: 'dubai',
    name: 'Dubái',
    country: 'UAE',
    continent: 'Asia',
    x: 60,
    y: 40,
    price: 1600,
    duration: '6 días',
    color: 'from-amber-500 to-yellow-600',
    description: 'Lujo y modernidad',
  },
  {
    id: 'london',
    name: 'Londres',
    country: 'Reino Unido',
    continent: 'Europa',
    x: 45,
    y: 22,
    price: 1250,
    duration: '7 días',
    color: 'from-slate-500 to-gray-700',
    description: 'Historia y cultura',
  },
  {
    id: 'rio',
    name: 'Río de Janeiro',
    country: 'Brasil',
    continent: 'América',
    x: 35,
    y: 65,
    price: 980,
    duration: '8 días',
    color: 'from-green-500 to-emerald-600',
    description: 'Playas y carnaval',
  },
]

export default function InteractiveDestinationMap() {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [planePosition, setPlanePosition] = useState({ x: 50, y: 50 })
  const [isFlying, setIsFlying] = useState(false)
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null)

  const flyToDestination = (destination: Destination) => {
    setIsFlying(true)
    setPlanePosition({ x: destination.x, y: destination.y })

    setTimeout(() => {
      setIsFlying(false)
      setSelectedDestination(destination)
    }, 1500)
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/20 backdrop-blur-md text-white border-white/30">
            <Plane className="w-3 h-3 mr-1" />
            Explorar Destinos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Vuela a tu próximo
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              destino
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Haz click en cualquier destino para explorar paquetes increíbles
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-blue-950/50 to-indigo-950/50 rounded-3xl border-2 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Destinations */}
              {destinations.map((destination) => (
                <motion.div
                  key={destination.id}
                  className="absolute"
                  style={{
                    left: `${destination.x}%`,
                    top: `${destination.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  whileHover={{ scale: 1.2 }}
                  onHoverStart={() => setHoveredDestination(destination.id)}
                  onHoverEnd={() => setHoveredDestination(null)}
                >
                  <button
                    onClick={() => flyToDestination(destination)}
                    className="relative group"
                  >
                    {/* Pin pulse animation */}
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${destination.color} opacity-50 blur-lg`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />

                    {/* Pin icon */}
                    <div className={`relative w-8 h-8 rounded-full bg-gradient-to-r ${destination.color} flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform`}>
                      <MapPin className="w-4 h-4 text-white" />
                    </div>

                    {/* Tooltip on hover */}
                    <AnimatePresence>
                      {hoveredDestination === destination.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        >
                          <div className="bg-white/95 backdrop-blur-xl px-3 py-2 rounded-lg shadow-xl border border-white/20">
                            <p className="text-sm font-bold text-gray-900">{destination.name}</p>
                            <p className="text-xs text-gray-600">{destination.country}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Connection lines when selected */}
                  {selectedDestination?.id === destination.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute inset-0 rounded-full border-2 border-white/50`}
                      style={{ width: '120px', height: '120px', left: '-46px', top: '-46px' }}
                    />
                  )}
                </motion.div>
              ))}

              {/* Animated Plane */}
              <motion.div
                className="absolute z-20"
                animate={{
                  left: `${planePosition.x}%`,
                  top: `${planePosition.y}%`,
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.div
                  animate={{
                    rotate: isFlying ? [0, -10, 0, 10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isFlying ? Infinity : 0,
                  }}
                >
                  <Plane className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                </motion.div>

                {/* Plane trail */}
                {isFlying && (
                  <motion.div
                    className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>

              {/* Flight path visualization */}
              {isFlying && selectedDestination && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path
                    d={`M ${planePosition.x}% ${planePosition.y}% Q 50% 20% ${selectedDestination.x}% ${selectedDestination.y}%`}
                    stroke="rgba(34, 211, 238, 0.3)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                </svg>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-white/60 text-sm">
                ✈️ Haz click en cualquier pin para volar a ese destino
              </p>
            </div>
          </div>

          {/* Destination Info Card */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedDestination ? (
                <motion.div
                  key={selectedDestination.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedDestination.color} flex items-center justify-center mb-4`}>
                        <MapPin className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedDestination.name}
                      </h3>
                      <p className="text-gray-600 mb-1">{selectedDestination.country}</p>
                      <Badge className="mb-4" variant="secondary">
                        {selectedDestination.continent}
                      </Badge>

                      <p className="text-gray-700 mb-6">
                        {selectedDestination.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Desde</span>
                          <span className="font-bold text-gray-900">${selectedDestination.price}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">Duración:</span>
                          <span className="font-bold text-gray-900">{selectedDestination.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-600">Disponible todo el año</span>
                        </div>
                      </div>

                      <Link href="#paquetes">
                        <Button className={`w-full bg-gradient-to-r ${selectedDestination.color} hover:opacity-90 transition-opacity`}>
                          Ver Paquete Completo
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-12 text-center">
                      <Plane className="w-16 h-16 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">
                        Selecciona un destino para ver detalles
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
