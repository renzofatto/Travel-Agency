# Sistema de Mapas - Implementación Completa

**Fecha**: 2025-11-15

## Resumen

Se ha implementado completamente el sistema de mapas interactivos para el sistema de paquetes de viaje, incluyendo:

1. **Location Picker** - Selector de ubicación con mapa y búsqueda para el formulario de creación/edición de itinerarios
2. **Route Map** - Visualización de la ruta completa en la página de detalle del paquete

---

## ✅ Completado

### 1. Base de Datos

#### Migración: `supabase/migrations/add_coordinates_to_itinerary.sql`

**Cambios:**
- Agregadas columnas `latitude` (DECIMAL 10,8) y `longitude` (DECIMAL 11,8) a `package_itinerary_items`
- Constraints de validación: latitude [-90, 90], longitude [-180, 180]
- Índice compuesto para queries de coordenadas
- Comentarios en las columnas

**Estado:** ⚠️ **PENDIENTE DE EJECUCIÓN**

### 2. Validación (Zod)

**Archivo:** `lib/validations/package.ts`

**Cambios:**
```typescript
export const packageItineraryItemBaseSchema = z.object({
  // ... campos existentes
  location: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  // ... otros campos
})
```

### 3. Server Actions

**Archivo:** `lib/actions/package-actions.ts`

**Funciones actualizadas:**
- `createPackageItineraryItem` - Ahora guarda latitude/longitude
- `updatePackageItineraryItem` - Ahora actualiza latitude/longitude

**Cambios:**
```typescript
// En insert/update
latitude: data.latitude || null,
longitude: data.longitude || null,
```

### 4. Componente LocationPicker

**Archivo:** `components/packages/location-picker.tsx` (NUEVO)

**Características:**
- 🗺️ Mapa interactivo con Leaflet + OpenStreetMap
- 🔍 Búsqueda de ubicaciones con Nominatim API (gratuito)
- 📍 Click en el mapa para seleccionar ubicación
- 🔄 Reverse geocoding para obtener nombre de lugar
- ✅ SSR-safe con dynamic imports
- 💾 Retorna: location name, latitude, longitude

**Uso:**
```tsx
<LocationPicker
  value={form.watch('location')}
  latitude={form.watch('latitude')}
  longitude={form.watch('longitude')}
  onChange={(location, lat, lng) => {
    form.setValue('location', location)
    form.setValue('latitude', lat)
    form.setValue('longitude', lng)
  }}
/>
```

**APIs utilizadas:**
- **Geocoding**: `https://nominatim.openstreetmap.org/search?format=json&q={query}`
- **Reverse Geocoding**: `https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}`

### 5. Formulario de Itinerario

**Archivo:** `components/packages/package-itinerary-form.tsx`

**Cambios:**
- Campo simple de "Location" reemplazado por `<LocationPicker />`
- Formulario ahora incluye latitude/longitude en defaultValues
- Integración con React Hook Form mediante setValue()

### 6. Componente RouteMap

**Archivo:** `components/packages/route-map.tsx` (NUEVO)

**Características:**
- 🗺️ Visualización de ruta completa del paquete
- 📍 Marcadores personalizados con emojis por categoría
- 🔢 Números de día en los marcadores
- 📏 Línea punteada conectando ubicaciones en orden
- 🎯 Auto-centrado y zoom inteligente
- 📊 Leyenda con conteo por categoría
- 💬 Popups con detalles de actividad
- 📭 Estado vacío cuando no hay coordenadas

**Marcadores personalizados:**
- Emoji según categoría (✈️ 🏨 🎯 🍽️ 📍)
- Número de día del itinerario
- Borde azul con sombra
- Punta de marcador estilo Google Maps

**Orden de puntos:**
- Ordenados por `day_number` y luego `order_index`
- Ruta refleja el itinerario cronológico

### 7. Página de Detalle del Paquete

**Archivo:** `app/paquetes/[id]/page.tsx`

**Cambios:**

1. **Query actualizada** - Ahora incluye latitude/longitude:
```typescript
package_itinerary_items (
  id, title, description, day_number,
  start_time, end_time, location,
  latitude, longitude,  // NUEVO
  category, order_index
)
```

2. **RouteMap agregado** - Después de la sección de itinerario:
```tsx
{pkg.package_itinerary_items.some((item) => item.latitude && item.longitude) && (
  <div>
    <h2 className="text-3xl font-bold mb-4 text-gray-900 flex items-center gap-2">
      <MapPin className="w-8 h-8 text-blue-600" />
      Mapa de la Ruta
    </h2>
    <RouteMap items={pkg.package_itinerary_items} />
  </div>
)}
```

**Condiciones de visualización:**
- Solo se muestra si al menos un item tiene coordenadas
- Se oculta automáticamente si ningún item tiene ubicación

---

## 🎨 Características del Sistema de Mapas

### LocationPicker (Formulario Admin)

**UX Features:**
- Input de búsqueda con ícono
- Dropdown de resultados con scroll
- Display de ubicación seleccionada con coordenadas
- Mapa de 400px de altura
- Tip de ayuda al usuario
- Validación en cliente y servidor

**Interacción:**
1. Usuario escribe ubicación (ej: "Torre Eiffel")
2. Presiona Enter o botón de búsqueda
3. Ve dropdown con sugerencias
4. Hace click en sugerencia → mapa se centra
5. O hace click directamente en el mapa
6. Sistema hace reverse geocoding para obtener nombre
7. Coordenadas se guardan en el formulario

### RouteMap (Página Pública)

**Visual Features:**
- Mapa de 500px de altura
- Marcadores con estilo custom (emoji + número día)
- Línea punteada azul conectando puntos
- Popups con información completa
- Leyenda con conteo por categoría
- Mensaje cuando no hay datos

**Auto-zoom inteligente:**
```typescript
// Calcula el rango geográfico de todos los puntos
const latRange = Math.max(...lats) - Math.min(...lats)
const lngRange = Math.max(...lngs) - Math.min(...lngs)

// Ajusta el zoom según el rango
if (maxRange < 0.01) zoom = 14    // Muy cerca
else if (maxRange < 0.1) zoom = 12
else if (maxRange < 1) zoom = 9
else if (maxRange < 5) zoom = 7
// ...
```

**Categorías con emojis:**
- `transport`: ✈️ Transporte
- `accommodation`: 🏨 Alojamiento
- `activity`: 🎯 Actividades
- `food`: 🍽️ Comidas
- `other`: 📍 Otros

---

## 📦 Dependencias Utilizadas

**Ya instaladas:**
- `leaflet` - Biblioteca de mapas
- `react-leaflet` - Componentes React para Leaflet
- `next/dynamic` - Dynamic imports para SSR

**APIs gratuitas:**
- **OpenStreetMap Tiles** - Mapas base
- **Nominatim API** - Geocoding/Reverse geocoding
  - Rate limit: 1 request/segundo
  - No requiere API key
  - Uso justo permitido

---

## 🚀 Próximos Pasos

### Paso 1: Migrar la Base de Datos

**Ejecutar en Supabase SQL Editor:**

```bash
# Archivo a ejecutar
supabase/migrations/add_coordinates_to_itinerary.sql
```

**Qué hace:**
- Agrega columnas latitude/longitude
- Crea constraints de validación
- Crea índice para queries
- Es idempotente (se puede ejecutar múltiples veces)

### Paso 2: Probar el Sistema

1. **Crear un paquete de prueba** (como admin):
   - Ir a `/admin/packages/new`
   - Crear paquete de prueba
   - Marcar como "Featured"

2. **Agregar itinerario con ubicaciones**:
   - Ir a "Edit Itinerary"
   - Crear actividad
   - Buscar ubicación (ej: "Torre Eiffel, París")
   - Seleccionar del dropdown o click en mapa
   - Guardar

3. **Repetir para múltiples actividades** en diferentes días

4. **Ver resultado en landing**:
   - Ir a `/` (landing page)
   - Ver paquete destacado
   - Click en "Ver más"
   - Debería mostrar mapa con ruta

### Paso 3: (Opcional) Migrar Paquetes Existentes

Si ya tienes paquetes con campo `location` (texto), puedes:

**Opción A - Dejar como está**
- Nuevos items usarán el mapa
- Items viejos solo mostrarán texto

**Opción B - Geocodificar manualmente**
- Editar cada item desde admin panel
- Buscar la ubicación en el mapa
- Guardar para agregar coordenadas

**Opción C - Script de migración automático**
- Crear script que lea todos los items con location
- Geocodificar usando Nominatim
- Actualizar las coordenadas
- ⚠️ Respetar rate limit de 1 req/seg

---

## 🔧 Configuración Técnica

### Leaflet CSS

**Ya incluido en:** `app/globals.css`

```css
/* Leaflet Map Styles */
@import 'leaflet/dist/leaflet.css';
```

### Dynamic Imports Pattern

```typescript
// SSR-safe import
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

// Estado de cliente
const [isClient, setIsClient] = useState(false)
useEffect(() => {
  setIsClient(true)
  import('leaflet').then((leaflet) => {
    setL(leaflet.default)
  })
}, [])
```

### Marker Icons

**Por defecto Leaflet:**
```typescript
L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
```

**Custom con emojis:**
```typescript
L.divIcon({
  html: `<div style="...">${emoji}</div>`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [0, -52],
})
```

---

## 🌐 Alternativas a OpenStreetMap

Si en el futuro necesitas cambiar de proveedor de mapas:

### Mapbox (Recomendado para producción)

```typescript
<TileLayer
  url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
  attribution='© <a href="https://www.mapbox.com/">Mapbox</a>'
  id="mapbox/streets-v11"
  accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
/>
```

**Pros:**
- Más estable y rápido
- Mejor calidad visual
- Sin rate limits estrictos
- Geocoding API más preciso

**Contras:**
- Requiere API key
- Gratis hasta 50k requests/mes
- Después $0.50 por 1000 requests

### Google Maps

Requiere reemplazar Leaflet con `@react-google-maps/api`.

---

## 📝 Notas Importantes

### Rate Limits de Nominatim

**Límites:**
- 1 request por segundo
- Máximo uso razonable
- Sin API key requerida

**Si excedes:**
- Implementar debouncing en búsqueda
- Caché de resultados frecuentes
- O migrar a Mapbox

### Performance

**Optimizaciones aplicadas:**
- Dynamic imports para reducir bundle inicial
- Caché de resultados de geocoding en estado
- Polyline en lugar de múltiples líneas
- Markers con divIcon (más rápido que ImageOverlay)

### Accesibilidad

**Mejoras posibles:**
- Agregar `aria-label` a los marcadores
- Teclado navigation en búsqueda
- Descripción alt para mapa

---

## 🎉 Resultado Final

### Admin Panel
Cuando el admin crea/edita itinerary items:
- ✅ Ve un mapa interactivo
- ✅ Busca ubicaciones por nombre
- ✅ Selecciona con click
- ✅ Ve coordenadas guardadas

### Página Pública
Cuando un usuario ve un paquete:
- ✅ Ve la ruta completa visualizada
- ✅ Marcadores ordenados por día
- ✅ Línea conectando puntos
- ✅ Popups con detalles
- ✅ Auto-zoom inteligente

---

## ✨ Próximas Mejoras (Opcionales)

1. **Geocoding con debounce** - Búsqueda mientras escribes
2. **Caché de geocoding** - Evitar requests repetidas
3. **Clustering de markers** - Para muchos puntos cercanos
4. **Elevación del terreno** - Mostrar dificultad topográfica
5. **Exportar GPX** - Para GPS devices
6. **Street View integration** - Imágenes de ubicaciones
7. **Weather integration** - Clima en fechas del viaje

---

**Estado:** ✅ Implementación completa
**Pendiente:** Ejecutar migración en Supabase
**Testing:** Listo para probar tras migración
