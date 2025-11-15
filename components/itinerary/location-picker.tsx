'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// Dynamic import for map
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

interface LocationResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
}

interface LocationPickerProps {
  value: string
  onChange: (location: string, coords?: [number, number]) => void
  label?: string
  placeholder?: string
}

export default function LocationPicker({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Search for a place...',
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value || '')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }, [])

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&addressdetails=1`
        )
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSelectLocation = (result: LocationResult) => {
    const coords: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)]
    setSearchQuery(result.display_name)
    setSelectedCoords(coords)
    setSuggestions([])
    setShowMap(true)
    onChange(result.display_name, coords)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSelectedCoords(null)
    setShowMap(false)
    setSuggestions([])
    onChange('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    if (!newValue) {
      handleClear()
    }
  }

  // Create custom marker icon
  const createCustomIcon = useCallback(() => {
    if (!L || typeof window === 'undefined') return undefined

    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }, [L])

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="border rounded-lg shadow-lg bg-white max-h-60 overflow-y-auto">
          {suggestions.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelectLocation(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Preview Map */}
      {showMap && selectedCoords && isClient && L && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Selected Location</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMap(false)}
            >
              Hide Map
            </Button>
          </div>
          <div className="h-[200px] w-full">
            <MapContainer
              center={selectedCoords}
              zoom={13}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedCoords} icon={createCustomIcon()} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Show Map Button (if location selected but map hidden) */}
      {selectedCoords && !showMap && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(true)}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Show Location on Map
        </Button>
      )}
    </div>
  )
}
