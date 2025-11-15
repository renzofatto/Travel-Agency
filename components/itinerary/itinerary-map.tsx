'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map components to avoid SSR issues
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

interface ItineraryItem {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  category: string
}

interface ItineraryMapProps {
  items: ItineraryItem[]
}

const categoryEmojis: Record<string, string> = {
  transport: '🚗',
  accommodation: '🏨',
  activity: '🎯',
  food: '🍽️',
  other: '📌',
}

// Simple geocoding function using Nominatim (OpenStreetMap)
async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}&limit=1`
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch (error) {
    console.error('Geocoding error:', error)
  }
  return null
}

export default function ItineraryMap({ items }: ItineraryMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [locations, setLocations] = useState<
    Array<{ item: ItineraryItem; coords: [number, number] }>
  >([])
  const [loading, setLoading] = useState(true)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Import Leaflet dynamically
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  useEffect(() => {
    if (!isClient || !L) return

    const itemsWithLocation = items.filter((item) => item.location && item.location.trim())

    if (itemsWithLocation.length === 0) {
      setLoading(false)
      return
    }

    // Geocode all locations
    Promise.all(
      itemsWithLocation.map(async (item) => {
        const coords = await geocodeLocation(item.location!)
        return coords ? { item, coords } : null
      })
    ).then((results) => {
      const validLocations = results.filter((r) => r !== null) as Array<{
        item: ItineraryItem
        coords: [number, number]
      }>
      setLocations(validLocations)
      setLoading(false)
    })
  }, [items, isClient, L])

  if (!isClient || !L) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Geocoding locations...</p>
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No locations to display</p>
          <p className="text-gray-500 text-sm mt-1">
            Add locations to your itinerary items to see them on the map
          </p>
        </div>
      </div>
    )
  }

  // Calculate center and zoom level
  const centerLat =
    locations.reduce((sum, loc) => sum + loc.coords[0], 0) / locations.length
  const centerLng =
    locations.reduce((sum, loc) => sum + loc.coords[1], 0) / locations.length
  const center: [number, number] = [centerLat, centerLng]

  // Custom icon
  const customIcon = (category: string) => {
    if (typeof window === 'undefined' || !L) return undefined

    return L.divIcon({
      html: `<div style="background: white; border: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">${categoryEmojis[category] || '📍'}</div>`,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={center}
        zoom={locations.length === 1 ? 13 : 10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(({ item, coords }, index) => (
          <Marker key={item.id} position={coords} icon={customIcon(item.category)}>
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{categoryEmojis[item.category]}</span>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{item.location}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
