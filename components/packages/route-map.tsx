'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic imports for SSR compatibility
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false })

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
  category: string
  order_index: number
}

interface RouteMapProps {
  items: ItineraryItem[]
}

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
  transport: '✈️',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📍',
}

export default function RouteMap({ items }: RouteMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  // Filter items with valid coordinates and sort by day and order
  const locatedItems = useMemo(() => {
    return items
      .filter((item) => item.latitude !== null && item.longitude !== null)
      .sort((a, b) => {
        if (a.day_number !== b.day_number) {
          return a.day_number - b.day_number
        }
        return a.order_index - b.order_index
      })
  }, [items])

  // Calculate map center and bounds
  const { center, zoom } = useMemo(() => {
    if (locatedItems.length === 0) {
      return { center: [0, 0] as [number, number], zoom: 2 }
    }

    if (locatedItems.length === 1) {
      return {
        center: [locatedItems[0].latitude!, locatedItems[0].longitude!] as [number, number],
        zoom: 13,
      }
    }

    // Calculate center as average of all points
    const avgLat =
      locatedItems.reduce((sum, item) => sum + (item.latitude || 0), 0) / locatedItems.length
    const avgLng =
      locatedItems.reduce((sum, item) => sum + (item.longitude || 0), 0) / locatedItems.length

    // Calculate bounds to determine zoom
    const lats = locatedItems.map((item) => item.latitude!)
    const lngs = locatedItems.map((item) => item.longitude!)
    const latRange = Math.max(...lats) - Math.min(...lats)
    const lngRange = Math.max(...lngs) - Math.min(...lngs)
    const maxRange = Math.max(latRange, lngRange)

    // Estimate zoom level based on range
    let estimatedZoom = 10
    if (maxRange < 0.01) estimatedZoom = 14
    else if (maxRange < 0.1) estimatedZoom = 12
    else if (maxRange < 1) estimatedZoom = 9
    else if (maxRange < 5) estimatedZoom = 7
    else if (maxRange < 10) estimatedZoom = 6
    else estimatedZoom = 5

    return { center: [avgLat, avgLng] as [number, number], zoom: estimatedZoom }
  }, [locatedItems])

  // Create polyline coordinates (route)
  const routeCoordinates = useMemo(() => {
    return locatedItems.map((item) => [item.latitude!, item.longitude!] as [number, number])
  }, [locatedItems])

  // Custom icon for markers
  const createIcon = (category: string, dayNumber: number) => {
    if (!L) return undefined

    const emoji = categoryEmojis[category] || '📍'

    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid #2563eb;
          "></div>
          <div style="
            position: absolute;
            top: 0;
            background: white;
            border: 2px solid #2563eb;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          ">
            ${emoji}
          </div>
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #2563eb;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${dayNumber}
          </div>
        </div>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
      popupAnchor: [0, -52],
      className: 'custom-marker-icon',
    })
  }

  // If no items with coordinates
  if (locatedItems.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No hay ubicaciones con coordenadas</p>
          <p className="text-sm text-gray-500">
            Las actividades del itinerario no tienen ubicaciones definidas
          </p>
        </div>
      </div>
    )
  }

  if (!isClient || !L) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '500px', width: '100%' }}
          key={`${center[0]}-${center[1]}-${zoom}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Route polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              color="#2563eb"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}

          {/* Markers for each location */}
          {locatedItems.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude!, item.longitude!]}
              icon={createIcon(item.category, item.day_number)}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryEmojis[item.category] || '📍'}</span>
                    <p className="font-semibold text-sm">Día {item.day_number}</p>
                  </div>
                  <p className="font-bold text-base mb-1">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{item.description}</p>
                  )}
                  {item.location && (
                    <p className="text-xs text-gray-500 mb-1">📍 {item.location}</p>
                  )}
                  {(item.start_time || item.end_time) && (
                    <p className="text-xs text-gray-500">
                      ⏰{' '}
                      {item.start_time && item.end_time
                        ? `${item.start_time} - ${item.end_time}`
                        : item.start_time || item.end_time}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-semibold mb-3">Leyenda:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(categoryEmojis).map(([category, emoji]) => {
            const count = locatedItems.filter((item) => item.category === category).length
            if (count === 0) return null

            const labels: Record<string, string> = {
              transport: 'Transporte',
              accommodation: 'Alojamiento',
              activity: 'Actividades',
              food: 'Comidas',
              other: 'Otros',
            }

            return (
              <div key={category} className="flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                <div>
                  <p className="text-xs font-medium">{labels[category]}</p>
                  <p className="text-xs text-gray-500">{count} punto{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Los números indican el día del itinerario. La línea punteada muestra la ruta aproximada.
        </p>
      </div>
    </div>
  )
}
