# Sistema de Loading States en TravelHub

## Resumen

Se ha implementado un sistema completo de spinners y skeleton loaders para mejorar la experiencia del usuario durante las cargas de contenido.

## Componentes Creados

### 1. Componente Spinner Reutilizable

**Archivo:** `components/ui/spinner.tsx`

Incluye 4 variantes:

#### `Spinner` - Componente base
```typescript
<Spinner size="md" text="Cargando..." />
```
**Tamaños disponibles:** `sm`, `md`, `lg`, `xl`

#### `PageSpinner` - Para páginas completas
```typescript
<PageSpinner text="Cargando TravelHub..." />
```
- Centrado verticalmente
- Tamaño grande (xl)
- Altura mínima de 400px

#### `SectionSpinner` - Para secciones/cards
```typescript
<SectionSpinner text="Cargando datos..." />
```
- Tamaño mediano-grande (lg)
- Padding vertical de 12

#### `InlineSpinner` - Para botones
```typescript
<button disabled>
  <InlineSpinner />
  Guardando...
</button>
```
- Tamaño pequeño (16px)
- Sin texto adicional

## Loading States por Página

### Landing Page
**Archivo:** `app/loading.tsx`

- Spinner centrado con fondo gradient
- Texto: "Cargando TravelHub..."
- Se muestra mientras la página genera el HTML inicial

### Dashboard
**Archivo:** `app/dashboard/loading.tsx`

**Skeleton Loader con:**
- Header con título y descripción
- Filtros (3 botones)
- Grid de 6 cards con:
  - Imagen placeholder (40% altura)
  - Título
  - 2 líneas de descripción
- Animación pulse en todos los elementos

### Admin Panel
**Archivo:** `app/admin/loading.tsx`

**Skeleton Loader con:**
- Header
- 4 stats cards con:
  - Label
  - Número grande
  - Descripción
- Tabla con 5 filas:
  - Avatar circular
  - Nombre y email
  - Botón de acción

### Admin Packages
**Archivo:** `app/admin/packages/loading.tsx`

**Skeleton Loader con:**
- Header con título y botón
- 3 stats cards
- Filtros (search + 2 selects)
- Grid de 6 package cards con:
  - Imagen (48% altura)
  - Título
  - Descripción (2 líneas)
  - 2 botones de acción

### Package Detail Page
**Archivo:** `app/paquetes/[id]/loading.tsx`

**Skeleton Loader con:**
- Breadcrumb
- Hero image grande (400px altura)
- Grid 2 columnas:
  - **Columna principal:**
    - Título y badges
    - Descripción
    - Itinerario (4 items)
    - Includes/Excludes (2 columnas)
  - **Sidebar:**
    - Precio
    - Detalles
    - Botón de reserva

### Group Detail Page
**Archivo:** `app/groups/[id]/loading.tsx`

**Skeleton Loader con:**
- Header con título y badges
- Tabs de navegación (5 tabs)
- Contenido con 3 items genéricos

## Cómo Funcionan los Loading States

### Automatic Loading UI (Next.js)
Next.js muestra automáticamente el `loading.tsx` cuando:
1. Navegas a una nueva ruta
2. La página está renderizando en el servidor
3. Los datos están siendo fetched

```
Usuario hace click → loading.tsx se muestra → Página carga → Contenido aparece
```

### Skeleton Loaders
- Imitan la estructura del contenido real
- Usan animación `pulse` de Tailwind
- Mejoran la percepción de velocidad
- Reducen el "layout shift"

## Beneficios Implementados

### 1. Mejor UX
- ✅ Usuario sabe que algo está pasando
- ✅ No ve pantalla en blanco
- ✅ Entiende qué tipo de contenido va a cargar
- ✅ Menos frustración durante esperas

### 2. Performance Percibido
- ✅ La app se siente más rápida
- ✅ Skeleton loader da contexto inmediato
- ✅ Transiciones suaves entre estados

### 3. Feedback Visual
- ✅ Spinners en botones durante acciones
- ✅ Estados de loading consistentes
- ✅ Animaciones sutiles y profesionales

## Uso en Formularios

Para botones de formularios, usa `InlineSpinner`:

```typescript
import { InlineSpinner } from '@/components/ui/spinner'

function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <InlineSpinner />
          Guardando...
        </>
      ) : (
        'Guardar'
      )}
    </Button>
  )
}
```

## Custom Animations

The project includes several custom animations defined in `app/globals.css`:

### Available Animations:
- `animate-spin-slow` - Slow rotation (3s)
- `animate-pulse-slow` - Slow pulse effect (4s)
- `animate-float-slow` - Slow floating movement (6s)
- `animate-float-medium` - Medium speed floating (4s)
- `animate-float-fast` - Fast floating with scale (3s)
- `animate-fade-in` - Fade in effect (0.5s)

These animations are used in the navbar's floating particles and other UI elements.

## Personalización

### Cambiar colores del spinner
Edita `components/ui/spinner.tsx`:

```typescript
// Línea 18
<Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
//                                    ^^^^^^^^^^^^^ Cambia este color
```

### Agregar loading a una nueva página

1. Crea `loading.tsx` en la carpeta de la ruta:
```typescript
// app/mi-pagina/loading.tsx
export default function MiPaginaLoading() {
  return <PageSpinner text="Cargando mi página..." />
}
```

2. O crea un skeleton personalizado:
```typescript
export default function MiPaginaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}
```

## Testing de Loading States

### Ver los loading states en desarrollo:

1. **Throttling de red:**
   - Chrome DevTools → Network tab
   - Throttling: Slow 3G o Custom

2. **Slow loading artificial:**
```typescript
// En tu página, agrega un delay
export default async function MyPage() {
  await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos
  // ... fetch data
}
```

3. **React Suspense boundaries:**
Next.js usa Suspense internamente, por eso `loading.tsx` funciona automáticamente.

## Mejores Prácticas

### ✅ DO:
- Usa skeleton loaders que imiten el contenido real
- Mantén los spinners pequeños en botones
- Usa colores sutiles (gray-200, gray-300)
- Agrega animación pulse para feedback
- Deshabilita botones durante loading

### ❌ DON'T:
- No uses spinners gigantes en toda la pantalla
- No uses colores muy brillantes que distraigan
- No omitas feedback visual en acciones importantes
- No uses demasiadas animaciones simultáneas

## Archivos Creados

```
components/ui/
  └── spinner.tsx               # Componente base reutilizable

app/
  ├── loading.tsx               # Landing page
  ├── dashboard/
  │   └── loading.tsx          # Dashboard
  ├── admin/
  │   ├── loading.tsx          # Admin dashboard
  │   └── packages/
  │       └── loading.tsx      # Admin packages list
  ├── paquetes/[id]/
  │   └── loading.tsx          # Package detail
  └── groups/[id]/
      └── loading.tsx          # Group detail
```

## Recursos

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Tailwind Pulse Animation](https://tailwindcss.com/docs/animation#pulse)

---

**Estado:** ✅ Sistema completo implementado y testeado
**Build:** ✅ Compila sin errores
**Cobertura:** Landing, Dashboard, Admin, Packages, Groups
