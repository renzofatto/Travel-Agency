'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Loader2 } from 'lucide-react'

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
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
)

interface LocationPickerProps {
  value?: string // Location name
  latitude?: number
  longitude?: number
  onChange: (location: string, lat: number, lng: number) => void
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({
  value = '',
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState(value)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string
    lat: number
    lng: number
  } | null>(
    value && latitude && longitude
      ? { name: value, lat: latitude, lng: longitude }
      : null
  )
  const [showResults, setShowResults] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0])
  const [mapZoom, setMapZoom] = useState(2)

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  // Initialize map position from props
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter([latitude, longitude])
      setMapZoom(13)
    }
  }, [latitude, longitude])

  // Geocode search using Nominatim (OpenStreetMap)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowResults(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Geocoding error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result selection
  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const name = result.display_name

    setSelectedLocation({ name, lat, lng })
    setSearchQuery(name)
    setShowResults(false)
    setMapCenter([lat, lng])
    setMapZoom(13)

    onChange(name, lat, lng)
  }

  // Handle map click
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        const name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        setSelectedLocation({ name, lat, lng })
        setSearchQuery(name)
        onChange(name, lat, lng)
      } catch (error) {
        console.error('Reverse geocoding error:', error)
        const name = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSelectedLocation({ name, lat, lng })
        setSearchQuery(name)
        onChange(name, lat, lng)
      }
    },
    [onChange]
  )

  // Custom icon for marker
  const getIcon = () => {
    if (!L) return undefined
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar ubicación (ej: Torre Eiffel, París)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.trim()) {
                  setShowResults(true)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto">
            <CardContent className="p-2">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-start gap-2 transition-colors"
                  onClick={() => handleSelectResult(result)}
                >
                  <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-sm">{result.display_name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Ubicación seleccionada:</p>
            <p className="text-sm text-blue-700">{selectedLocation.name}</p>
            <p className="text-xs text-blue-600 mt-1">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '400px', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Map click handler */}
          <MapClickHandler onClick={handleMapClick} />

          {/* Marker for selected location */}
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={getIcon()}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{selectedLocation.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Click en el mapa para cambiar la ubicación
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        💡 Tip: Busca una ubicación o haz click directamente en el mapa para seleccionar un lugar
      </p>
    </div>
  )
}
