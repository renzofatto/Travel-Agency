# Sistema de Paquetes de Viaje - Documentación de Implementación

## 📋 Resumen

Sistema que permite a los administradores crear paquetes de viaje predefinidos con itinerarios completos, que luego pueden ser asignados a grupos. Cuando un paquete se asigna a un grupo, se crea una copia independiente del itinerario.

## ✅ Implementado

### 1. Base de Datos

**Tablas Creadas:**

- **`travel_packages`** - Paquetes maestros del admin
  - `id` (UUID, PK)
  - `name` (VARCHAR 200) - Nombre del paquete
  - `description` (TEXT) - Descripción detallada
  - `destination` (VARCHAR 200) - Destino principal
  - `duration_days` (INTEGER) - Duración en días
  - `cover_image` (TEXT) - URL de imagen
  - `price_estimate` (DECIMAL) - Precio estimado (opcional)
  - `difficulty_level` (VARCHAR) - easy, moderate, challenging
  - `created_by` (UUID FK) - Admin creador
  - `is_active` (BOOLEAN) - Para archivar sin eliminar
  - Timestamps: `created_at`, `updated_at`

- **`package_itinerary_items`** - Items de itinerario del paquete
  - `id` (UUID, PK)
  - `package_id` (UUID FK) - Referencia al paquete
  - `day_number` (INTEGER) - Día del viaje (1, 2, 3...)
  - `title` (VARCHAR 200) - Título de la actividad
  - `description` (TEXT) - Descripción
  - `start_time` (TIME) - Hora de inicio
  - `end_time` (TIME) - Hora de fin
  - `location` (VARCHAR 200) - Ubicación
  - `category` (VARCHAR) - transport, accommodation, activity, food, other
  - `order_index` (INTEGER) - Orden dentro del mismo día
  - Timestamps: `created_at`, `updated_at`

**Modificación a tabla existente:**
- **`travel_groups`** - Agregada columna `source_package_id` (UUID FK opcional)
  - Rastrea el paquete original (solo referencia, no vínculo funcional)

**RLS Policies:**
- ✅ Todos pueden ver paquetes activos
- ✅ Solo admins pueden crear/editar/eliminar paquetes
- ✅ Solo admins pueden gestionar items de itinerario de paquetes

**Migración SQL:** `supabase/migrations/create_travel_packages.sql`

### 2. Validaciones (Zod)

**Archivo:** `lib/validations/package.ts`

**Schemas creados:**
- `createPackageSchema` - Crear paquete
- `editPackageSchema` - Editar paquete
- `packageItineraryItemSchema` - Item de itinerario
- `editPackageItineraryItemSchema` - Editar item
- `assignPackageToGroupSchema` - Asignar paquete a grupo

**Enums:**
- `difficultyLevelEnum` - easy, moderate, challenging
- `packageItemCategoryEnum` - transport, accommodation, activity, food, other

### 3. Server Actions

**Archivo:** `lib/actions/package-actions.ts`

**Funciones implementadas:**

**CRUD de Paquetes:**
- `createPackage(data)` - Crear paquete
- `updatePackage(data)` - Actualizar paquete
- `deletePackage(packageId)` - Eliminar paquete
- `togglePackageActive(packageId, isActive)` - Activar/desactivar

**CRUD de Items de Itinerario:**
- `createPackageItineraryItem(packageId, data)` - Crear item
- `updatePackageItineraryItem(data)` - Actualizar item
- `deletePackageItineraryItem(itemId)` - Eliminar item

**Asignación:**
- `assignPackageToGroup(data)` - Asignar paquete a grupo
  - Copia el itinerario completo
  - Ajusta las fechas según start_date del grupo
  - Guarda referencia del paquete original
  - Es una copia independiente (ediciones no afectan al paquete original)

## 🚧 Por Implementar (UI)

### 1. Página Admin - Listar Paquetes

**Ruta:** `/admin/packages`

**Contenido:**
- Lista de todos los paquetes (activos e inactivos)
- Filtros: activos/inactivos, por destino, por dificultad
- Stats: total paquetes, activos, duración promedio
- Botón "Create Package"
- Cards de paquetes con:
  - Cover image
  - Nombre y destino
  - Duración en días
  - Dificultad
  - Precio estimado
  - Badge de activo/inactivo
  - Acciones: Edit, Toggle Active, Delete

**Código base:**
```typescript
// app/admin/packages/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PackagesPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('travel_packages')
    .select(`
      *,
      package_itinerary_items(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header con botón Create */}
      {/* Stats cards */}
      {/* Lista de paquetes */}
    </div>
  )
}
```

### 2. Página Admin - Crear/Editar Paquete

**Ruta:** `/admin/packages/new` y `/admin/packages/[id]/edit`

**Formulario del Paquete:**
- Nombre
- Descripción (textarea)
- Destino
- Duración en días (number input)
- Cover image (upload)
- Precio estimado (opcional)
- Nivel de dificultad (select)
- Activo/Inactivo (checkbox)

**Sección de Itinerario:**
- Lista de items agrupados por día
- Botón "Add Activity" por cada día
- Form modal para agregar/editar actividad:
  - Día (number)
  - Título
  - Descripción
  - Hora inicio/fin
  - Ubicación
  - Categoría
  - Drag & drop para reordenar (opcional)

### 3. Diálogo - Asignar Paquete a Grupo

**Dónde:**
- En `/admin/packages` - botón en cada paquete
- En `/admin/groups` - botón en cada grupo

**Contenido del diálogo:**
- Select de paquetes (si se abre desde grupo)
- Select de grupos (si se abre desde paquete)
- Date picker para start_date
- Preview: "This will create a X-day trip from [start_date] to [end_date]"
- Botón "Assign Package"

**Código base:**
```typescript
// components/packages/assign-package-dialog.tsx
'use client'

import { assignPackageToGroup } from '@/lib/actions/package-actions'

export default function AssignPackageDialog({ packageId, groups }) {
  async function handleAssign(data) {
    const result = await assignPackageToGroup({
      package_id: packageId,
      group_id: data.group_id,
      start_date: data.start_date,
    })

    if (result.success) {
      toast.success('Package assigned successfully!')
    }
  }

  return <Dialog>...</Dialog>
}
```

### 4. Componentes Necesarios

**Lista de componentes a crear:**

```
components/packages/
├── package-card.tsx          - Card de paquete en lista
├── package-list.tsx          - Lista de paquetes
├── package-form.tsx          - Form create/edit paquete
├── package-itinerary-form.tsx - Form de items de itinerario
├── package-itinerary-list.tsx - Lista de items agrupados por día
├── assign-package-dialog.tsx  - Diálogo asignar a grupo
└── package-stats.tsx          - Stats de paquetes
```

## 🔄 Flujo de Uso Completo

### Flujo Admin: Crear y Asignar Paquete

1. **Admin va a /admin/packages**
2. **Click "Create Package"**
3. **Llena formulario básico:**
   - Nombre: "Aventura en Patagonia"
   - Destino: "El Calafate, Argentina"
   - Duración: 7 días
   - Dificultad: Moderate
4. **Agrega items de itinerario:**
   - Día 1: Vuelo Buenos Aires - El Calafate (transport)
   - Día 1: Check-in Hotel Los Glaciares (accommodation)
   - Día 2: Trek al Glaciar Perito Moreno (activity)
   - Día 3: Navegación Lago Argentino (activity)
   - etc...
5. **Guarda el paquete**
6. **Va a /admin/groups**
7. **Selecciona un grupo existente**
8. **Click "Assign Package"**
9. **Selecciona "Aventura en Patagonia"**
10. **Elige start_date: 2026-03-15**
11. **Confirma asignación**
12. **Sistema copia todos los items del paquete al grupo**
13. **Items se crean con fechas reales:**
    - 2026-03-15 (Día 1): Vuelo y Check-in
    - 2026-03-16 (Día 2): Trek al Glaciar
    - 2026-03-17 (Día 3): Navegación
    - etc...

### Flujo Grupo: Editar Itinerario Copiado

1. **Líder del grupo va a /groups/[id]/itinerary**
2. **Ve el itinerario completo del paquete asignado**
3. **Puede editar cualquier item:**
   - Cambiar horarios
   - Modificar ubicaciones
   - Agregar notas
   - Eliminar actividades
   - Agregar nuevas actividades
4. **Cambios NO afectan al paquete original**
5. **Otros grupos con el mismo paquete NO se ven afectados**

### Flujo Admin: Actualizar Paquete Maestro

1. **Admin edita "Aventura en Patagonia"**
2. **Agrega nueva actividad en Día 4**
3. **Guarda cambios**
4. **Grupos existentes NO se actualizan** (mantienen su itinerario independiente)
5. **Nuevos grupos que se asignen este paquete** tendrán la nueva actividad

## 📊 Casos de Uso

### Caso 1: Paquetes Estándar

**Problema:** Admin quiere ofrecer "Ruta del Vino en Mendoza" de 3 días

**Solución:**
1. Crea paquete "Ruta del Vino - 3 días"
2. Agrega itinerario detallado
3. Lo asigna a múltiples grupos a lo largo del año
4. Cada grupo puede personalizar su itinerario

### Caso 2: Plantillas Reutilizables

**Problema:** Muchos grupos quieren "City Tour Buenos Aires"

**Solución:**
1. Admin crea paquete "City Tour BA - 2 días"
2. Incluye actividades típicas: Caminito, Recoleta, Teatro Colón
3. Cada grupo que lo recibe puede:
   - Agregar restaurantes específicos
   - Cambiar orden de actividades
   - Eliminar lo que no les interese

### Caso 3: Paquetes Premium

**Problema:** Algunos paquetes son caros y complejos

**Solución:**
1. Admin crea "Expedición Ushuaia - 10 días"
2. Marca dificultad: Challenging
3. Precio estimado: $2500
4. Solo lo asigna a grupos que lo soliciten
5. Cada grupo adapta según presupuesto y capacidades

## 🔐 Seguridad y Permisos

### RLS Policies Implementadas

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `travel_packages` | Todos (solo activos) + Admins (todos) | Solo admins | Solo admins | Solo admins |
| `package_itinerary_items` | Todos (de paquetes activos) + Admins | Solo admins | Solo admins | Solo admins |

### Validaciones

- ✅ Solo admins pueden crear/editar/eliminar paquetes
- ✅ Duración mínima: 1 día, máxima: 365 días
- ✅ End time > Start time
- ✅ Day number >= 1
- ✅ Nombres y descripciones con límites de caracteres

## 📝 Notas Técnicas

### Independencia de Datos

**Importante:** Cuando se asigna un paquete a un grupo:
1. Se COPIAN los datos (no se referencian)
2. Se crea en `itinerary_items` (tabla del grupo)
3. Se guarda `source_package_id` solo como referencia histórica
4. NO hay foreign key constraint que bloquee ediciones

### Cálculo de Fechas

```typescript
// Ejemplo: Paquete de 7 días, start_date = 2026-03-15
// Día 1 (day_number=1) → 2026-03-15
// Día 2 (day_number=2) → 2026-03-16
// Día 7 (day_number=7) → 2026-03-21
// end_date = start_date + (duration_days - 1) = 2026-03-21

const itemDate = new Date(startDate)
itemDate.setDate(itemDate.getDate() + item.day_number - 1)
```

### Actualización Automática de updated_at

Se crean triggers que actualizan `updated_at` automáticamente:
- En `travel_packages`
- En `package_itinerary_items`

## 🚀 Próximos Pasos

1. **Crear las páginas admin** (3-4 archivos)
2. **Crear los componentes UI** (6-8 componentes)
3. **Agregar navegación** en sidebar admin
4. **Testing** de flujos completos
5. **Documentación** de usuario final

## 📚 Archivos del Sistema

```
Implementado:
✅ supabase/migrations/create_travel_packages.sql
✅ lib/validations/package.ts
✅ lib/actions/package-actions.ts

Por crear:
⏳ app/admin/packages/page.tsx
⏳ app/admin/packages/new/page.tsx
⏳ app/admin/packages/[id]/edit/page.tsx
⏳ components/packages/* (6-8 componentes)
```

---

**Estado**: Base de datos y backend completos, UI pendiente
**Fecha**: 2025-11-15
**Próximo**: Implementar UI admin
