'use client'

import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react'
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

// Component to handle map events and set reference
const MapEventHandler = dynamic(
  () => import('./map-event-handler').then((mod) => mod.MapEventHandler),
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
  selectedItemId?: string | null
}

export interface ItineraryMapRef {
  centerOnLocation: (itemId: string) => void
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

const ItineraryMap = forwardRef<ItineraryMapRef, ItineraryMapProps>(
  ({ items, selectedItemId }, ref) => {
    const [isClient, setIsClient] = useState(false)
    const [locations, setLocations] = useState<
      Array<{ item: ItineraryItem; coords: [number, number]; index: number }>
    >([])
    const [loading, setLoading] = useState(true)
    const [L, setL] = useState<any>(null)
    const mapRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
    // Import Leaflet dynamically
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    centerOnLocation: (itemId: string) => {
      const location = locations.find((loc) => loc.item.id === itemId)
      if (location && mapRef.current) {
        mapRef.current.setView(location.coords, 15, { animate: true, duration: 1 })
      }
    },
  }))

  useEffect(() => {
    if (!isClient || !L) return

    const itemsWithLocation = items.filter((item) => item.location && item.location.trim())

    if (itemsWithLocation.length === 0) {
      setLoading(false)
      return
    }

    // Geocode all locations with their original index
    Promise.all(
      itemsWithLocation.map(async (item, originalIndex) => {
        const coords = await geocodeLocation(item.location!)
        // Find the index in the original items array
        const indexInOriginal = items.findIndex((i) => i.id === item.id)
        return coords ? { item, coords, index: indexInOriginal + 1 } : null
      })
    ).then((results) => {
      const validLocations = results.filter((r) => r !== null) as Array<{
        item: ItineraryItem
        coords: [number, number]
        index: number
      }>
      setLocations(validLocations)
      setLoading(false)
    })
  }, [items, isClient, L])

  // Center on selected item when selectedItemId changes
  useEffect(() => {
    if (selectedItemId && mapRef.current && locations.length > 0) {
      const location = locations.find((loc) => loc.item.id === selectedItemId)
      if (location) {
        mapRef.current.setView(location.coords, 15, { animate: true, duration: 1 })
      }
    }
  }, [selectedItemId, locations])

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

  // Custom numbered icon
  const numberedIcon = (number: number, isSelected: boolean = false) => {
    if (typeof window === 'undefined' || !L) return undefined

    const bgColor = isSelected ? '#3b82f6' : '#ffffff'
    const textColor = isSelected ? '#ffffff' : '#3b82f6'
    const borderColor = '#3b82f6'

    return L.divIcon({
      html: `<div style="background: ${bgColor}; border: 3px solid ${borderColor}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: ${textColor}; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); transition: all 0.3s ease;">${number}</div>`,
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
        <MapEventHandler mapRef={mapRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(({ item, coords, index }) => {
          const isSelected = selectedItemId === item.id
          return (
            <Marker
              key={item.id}
              position={coords}
              icon={numberedIcon(index, isSelected)}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                      {index}
                    </div>
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
          )
        })}
      </MapContainer>
    </div>
  )
})

ItineraryMap.displayName = 'ItineraryMap'

export default ItineraryMap
