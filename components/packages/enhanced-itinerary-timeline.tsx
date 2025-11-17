'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ItineraryItem {
  id: string
  title: string
  description: string | null
  day_number: number
  start_time: string | null
  end_time: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  category: string
  order_index: number
}

interface EnhancedItineraryTimelineProps {
  items: ItineraryItem[]
}

const categoryEmojis: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📌',
}

const categoryColors: Record<string, string> = {
  transport: 'from-blue-500 to-blue-600',
  accommodation: 'from-purple-500 to-purple-600',
  activity: 'from-green-500 to-green-600',
  food: 'from-orange-500 to-orange-600',
  other: 'from-gray-500 to-gray-600',
}

export default function EnhancedItineraryTimeline({ items }: EnhancedItineraryTimelineProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])) // First day expanded by default

  // Group items by day
  const itemsByDay: Record<number, ItineraryItem[]> = {}
  items
    .sort((a, b) => a.day_number - b.day_number || a.order_index - b.order_index)
    .forEach((item) => {
      if (!itemsByDay[item.day_number]) {
        itemsByDay[item.day_number] = []
      }
      itemsByDay[item.day_number].push(item)
    })

  const days = Object.keys(itemsByDay).map(Number).sort((a, b) => a - b)

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(day)) {
        newSet.delete(day)
      } else {
        newSet.add(day)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedDays(new Set(days))
  }

  const collapseAll = () => {
    setExpandedDays(new Set())
  }

  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                Itinerario Detallado
              </h2>
              <p className="text-blue-100">
                {days.length} {days.length === 1 ? 'día' : 'días'} de aventura · {items.length} actividades
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={expandAll}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Expandir Todo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={collapseAll}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Contraer Todo
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 md:p-8">
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />

            {/* Days */}
            <div className="space-y-8">
              {days.map((day, dayIndex) => {
                const isExpanded = expandedDays.has(day)
                const dayItems = itemsByDay[day]
                const firstItem = dayItems[0]

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                    className="relative"
                  >
                    {/* Day Header */}
                    <div className="flex items-start gap-6 mb-4">
                      {/* Day Number Badge */}
                      <motion.div
                        className="relative z-10 flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center cursor-pointer"
                          onClick={() => toggleDay(day)}
                        >
                          <div className="text-center">
                            <div className="text-white text-2xl md:text-3xl font-bold leading-none">
                              {day}
                            </div>
                            <div className="text-white/80 text-xs uppercase tracking-wider">
                              Día
                            </div>
                          </div>
                        </div>
                        {/* Pulse animation for first day */}
                        {dayIndex === 0 && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-blue-500"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Day Summary Card */}
                      <motion.div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleDay(day)}
                        whileHover={{ scale: 1.01 }}
                      >
                        <Card className="border-2 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">
                                  Día {day}: {firstItem.title}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    <span>{firstItem.location || 'Ubicación a confirmar'}</span>
                                  </div>
                                  {dayItems.length > 1 && (
                                    <Badge variant="secondary">
                                      +{dayItems.length - 1} {dayItems.length === 2 ? 'actividad' : 'actividades'} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown className="w-6 h-6 text-gray-400" />
                              </motion.div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Day Activities - Expandable */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-20 md:ml-28 space-y-4 mb-4"
                        >
                          {dayItems.map((item, itemIndex) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIndex * 0.1 }}
                            >
                              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4"
                                style={{
                                  borderLeftColor: `var(--tw-gradient-stops, ${categoryColors[item.category] || 'from-gray-500'})`,
                                }}
                              >
                                <div className="grid md:grid-cols-3 gap-0">
                                  {/* Image Section */}
                                  {item.image_url && (
                                    <div className="relative h-56 md:h-full min-h-[200px] overflow-hidden group">
                                      <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                      />
                                      {/* Category Badge on Image */}
                                      <div className="absolute top-3 left-3">
                                        <Badge className={`bg-gradient-to-r ${categoryColors[item.category]} text-white border-0 shadow-lg`}>
                                          <span className="text-lg mr-1">{categoryEmojis[item.category]}</span>
                                          {item.category === 'transport' && 'Transporte'}
                                          {item.category === 'accommodation' && 'Alojamiento'}
                                          {item.category === 'activity' && 'Actividad'}
                                          {item.category === 'food' && 'Comida'}
                                          {item.category === 'other' && 'Otro'}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}

                                  {/* Content Section */}
                                  <div className={`${item.image_url ? 'md:col-span-2' : 'md:col-span-3'} p-6`}>
                                    <div className="flex items-start gap-4">
                                      {!item.image_url && (
                                        <span className="text-5xl flex-shrink-0">{categoryEmojis[item.category]}</span>
                                      )}
                                      <div className="flex-1">
                                        <h4 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h4>

                                        {item.description && (
                                          <p className="text-gray-600 leading-relaxed mb-4">
                                            {item.description}
                                          </p>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                          {item.start_time && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                                              <Clock className="w-4 h-4 text-blue-600" />
                                              <span className="font-medium text-gray-700">
                                                {item.start_time}
                                                {item.end_time && ` - ${item.end_time}`}
                                              </span>
                                            </div>
                                          )}
                                          {item.location && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                                              <MapPin className="w-4 h-4 text-green-600" />
                                              <span className="font-medium text-gray-700">{item.location}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
