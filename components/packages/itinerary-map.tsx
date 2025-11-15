'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
)

interface ItineraryDay {
  day: number
  title: string
  location?: {
    name: string
    lat: number
    lng: number
  }
}

interface ItineraryMapProps {
  days: ItineraryDay[]
  selectedDay?: number
}

export default function ItineraryRouteMap({ days, selectedDay }: ItineraryMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  if (!isClient || !L) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Cargando mapa de ruta...</p>
        </div>
      </div>
    )
  }

  const daysWithLocation = days.filter(day => day.location)

  if (daysWithLocation.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay ubicaciones en el itinerario</p>
        </div>
      </div>
    )
  }

  // Calculate center point
  const centerLat = daysWithLocation.reduce((sum, day) => sum + day.location!.lat, 0) / daysWithLocation.length
  const centerLng = daysWithLocation.reduce((sum, day) => sum + day.location!.lng, 0) / daysWithLocation.length
  const center: [number, number] = [centerLat, centerLng]

  // Create route line coordinates
  const routeCoordinates: [number, number][] = daysWithLocation.map(day => [
    day.location!.lat,
    day.location!.lng,
  ])

  // Custom numbered icon
  const numberedIcon = (number: number, isSelected: boolean = false) => {
    const bgColor = isSelected ? '#3b82f6' : '#10b981'
    const textColor = '#ffffff'
    const borderColor = isSelected ? '#1d4ed8' : '#059669'

    return L.divIcon({
      html: `<div style="background: ${bgColor}; border: 3px solid ${borderColor}; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: ${textColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease;">${number}</div>`,
      className: 'custom-route-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    })
  }

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-white">
      <MapContainer
        center={center}
        zoom={daysWithLocation.length === 1 ? 12 : 6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line connecting all locations */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Markers for each day */}
        {daysWithLocation.map((day) => {
          const isSelected = selectedDay === day.day
          return (
            <Marker
              key={day.day}
              position={[day.location!.lat, day.location!.lng]}
              icon={numberedIcon(day.day, isSelected)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                      {day.day}
                    </div>
                    <h3 className="font-bold text-gray-900">Día {day.day}</h3>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">{day.title}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{day.location!.name}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
