'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapEventHandlerProps {
  mapRef: React.MutableRefObject<any>
}

export function MapEventHandler({ mapRef }: MapEventHandlerProps) {
  const map = useMap()

  useEffect(() => {
    if (map) {
      mapRef.current = map
    }
  }, [map, mapRef])

  return null
}
