# Sistema de Imágenes para Items de Itinerario

**Fecha**: 2025-11-15

## Resumen

Se ha implementado un sistema completo para agregar imágenes a los items del itinerario de los paquetes. Los items ahora muestran imágenes de forma elegante en un diseño de dos columnas (imagen de un lado, información del otro).

---

## ✅ Completado

### 1. Base de Datos

#### Migración: `supabase/migrations/add_image_to_itinerary_items.sql`

**Cambios:**
- Agregada columna `image_url` (TEXT) a `package_itinerary_items`
- Índice para queries de imágenes
- Comentario en la columna

**SQL:**
```sql
ALTER TABLE public.package_itinerary_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_package_itinerary_images
ON public.package_itinerary_items(image_url)
WHERE image_url IS NOT NULL;
```

### 2. Storage (Supabase)

#### Script: `supabase/storage/itinerary-images-bucket.sql`

**Bucket creado:**
- `itinerary-item-images` (público)

**RLS Policies:**
- Admins pueden subir imágenes
- Público puede ver imágenes
- Admins pueden eliminar imágenes

### 3. Validación (Zod)

**Archivo:** `lib/validations/package.ts`

**Cambios:**
```typescript
export const packageItineraryItemBaseSchema = z.object({
  // ... otros campos
  image_url: z.string().url().optional().or(z.literal('')), // NEW
  // ... otros campos
})
```

### 4. Server Actions

**Archivo:** `lib/actions/package-actions.ts`

**Nueva función:**
```typescript
export async function uploadItineraryItemImage(formData: FormData)
```

**Características:**
- Validación de tipo de archivo (JPG, PNG, WEBP)
- Validación de tamaño (máx 10MB)
- Nombre único generado con timestamp
- Rollback automático si falla el guardado en DB
- Retorna URL pública

**Funciones actualizadas:**
- `createPackageItineraryItem` - Ahora guarda `image_url`
- `updatePackageItineraryItem` - Ahora actualiza `image_url`

### 5. Formulario de Admin

**Archivo:** `components/packages/package-itinerary-form.tsx`

**Nuevas características:**
- Campo de upload de imagen con preview
- Validación de archivo en cliente
- Subida automática antes de guardar
- Botón para eliminar imagen
- Estado de carga durante upload
- Preview de imagen existente al editar

**UI:**
```typescript
- Input file con accept específico
- Preview de imagen con opción de eliminar
- Loading indicator durante upload
- Validación de tamaño y tipo
```

### 6. Página de Detalle del Paquete

**Archivo:** `app/paquetes/[id]/page.tsx`

**Diseño actualizado:**
- Grid de 2 columnas en desktop
- Imagen ocupa 50% del espacio (izquierda)
- Contenido ocupa 50% del espacio (derecha)
- En móvil: imagen arriba, contenido abajo
- Si no hay imagen: contenido ocupa todo el ancho

**Estructura:**
```tsx
<div className="grid md:grid-cols-2 gap-4">
  {/* Imagen - solo si existe */}
  {item.image_url && (
    <div className="relative h-48 md:h-full min-h-[200px]">
      <Image src={item.image_url} alt={item.title} fill />
    </div>
  )}

  {/* Contenido */}
  <div className={`p-4 ${!item.image_url ? 'md:col-span-2' : ''}`}>
    <span>{emoji}</span>
    <h4>{title}</h4>
    <p>{description}</p>
    <div>{time} {location}</div>
  </div>
</div>
```

---

## 🎨 Diseño Visual

### Página de Detalle - Con Imagen

```
┌────────────────────────────────────────┐
│  Día 1                                 │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────┐  ┌─────────────────┐   │
│  │          │  │ 🎯 Hiking        │   │
│  │  Imagen  │  │                  │   │
│  │          │  │ Beautiful hike   │   │
│  │          │  │ in the mountains │   │
│  │          │  │                  │   │
│  │          │  │ ⏰ 08:00-16:00   │   │
│  │          │  │ 📍 Torres del... │   │
│  └──────────┘  └─────────────────┘   │
│                                        │
└────────────────────────────────────────┘
```

### Página de Detalle - Sin Imagen

```
┌────────────────────────────────────────┐
│  Día 1                                 │
├────────────────────────────────────────┤
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ 🍽️ Dinner                       │  │
│  │                                  │  │
│  │ Traditional food at local        │  │
│  │ restaurant                       │  │
│  │                                  │  │
│  │ ⏰ 19:00-21:00                   │  │
│  │ 📍 Downtown Restaurant          │  │
│  └─────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

---

## 📋 Migraciones a Ejecutar

### Paso 1: Migrar Tabla

Ejecutar en Supabase SQL Editor:

```bash
supabase/migrations/add_image_to_itinerary_items.sql
```

**Qué hace:**
- Agrega columna `image_url` a `package_itinerary_items`
- Crea índice para queries eficientes

### Paso 2: Configurar Storage

Ejecutar en Supabase SQL Editor:

```bash
supabase/storage/itinerary-images-bucket.sql
```

**Qué hace:**
- Crea bucket `itinerary-item-images` (público)
- Configura RLS policies para upload/view/delete

---

## 🚀 Cómo Usar

### Para el Admin (Crear/Editar Itinerario)

1. **Ir al panel de admin** → Packages → Editar paquete
2. **En la sección de itinerario**, agregar o editar un item
3. **Subir imagen**:
   - Click en el input de archivo
   - Seleccionar imagen (JPG, PNG, WEBP - máx 10MB)
   - Ver preview inmediatamente
   - Opcional: click en ✕ para eliminar
4. **Guardar** - La imagen se sube automáticamente

### Para el Usuario (Ver Paquete)

1. **Ir a la landing page** → Ver paquetes
2. **Click en "Ver más"** en un paquete
3. **Scroll a la sección de itinerario**
4. **Ver items con imágenes**:
   - Imagen de un lado
   - Información del otro
   - Diseño responsivo

---

## 🔧 Detalles Técnicos

### Validaciones

**Tipo de archivo:**
- JPG/JPEG ✅
- PNG ✅
- WEBP ✅
- Otros ❌

**Tamaño:**
- Máximo: 10MB
- Validado en cliente Y servidor

**URL:**
- Must be valid URL (Zod validation)
- Optional field

### Storage

**Bucket:** `itinerary-item-images`
- **Público**: Cualquiera puede ver
- **Upload**: Solo admins
- **Delete**: Solo admins

**Naming:**
```
{user_id}/{timestamp}.{extension}
Ejemplo: 123e4567-e89b-12d3-a456/1700000000000.jpg
```

### Performance

**Next.js Image:**
- Lazy loading automático
- Responsive sizes
- Optimización de imágenes
- Formato WebP cuando es posible

**Queries:**
- Índice en `image_url WHERE NOT NULL`
- Solo trae columnas necesarias
- Single query con JOIN

---

## 📱 Responsive Design

### Desktop (md+)
- Grid 2 columnas
- Imagen: 50% ancho
- Contenido: 50% ancho
- Imagen altura: 100% del contenedor

### Tablet/Mobile
- Stack vertical
- Imagen arriba: altura fija 192px
- Contenido abajo: altura automática

### Sin Imagen
- Contenido ocupa 100% ancho
- Misma estructura, solo sin columna de imagen

---

## ✨ Mejoras Futuras (Opcionales)

1. **Múltiples imágenes por item**
   - Galería de 2-3 imágenes
   - Slider/carousel

2. **Edición de imagen**
   - Crop antes de subir
   - Resize automático
   - Filtros

3. **Optimización automática**
   - Comprimir en servidor
   - Generar múltiples tamaños
   - CDN integration

4. **AI descriptions**
   - Generar descripción desde imagen
   - Detectar ubicación desde EXIF
   - Sugerir categoría

5. **Lazy loading mejorado**
   - Blur placeholder
   - Progressive loading
   - Skeleton screens

---

## 🐛 Troubleshooting

### La imagen no se muestra

**Problema**: URL guardada pero imagen no carga

**Soluciones:**
1. Verificar que el bucket sea público
2. Verificar RLS policies de storage
3. Verificar que la URL sea válida
4. Check browser console para errores CORS

### Error al subir imagen

**Problema**: "Failed to upload image"

**Soluciones:**
1. Verificar tamaño < 10MB
2. Verificar tipo de archivo permitido
3. Verificar que el usuario sea admin
4. Check storage quota en Supabase

### Imagen se ve distorsionada

**Problema**: Aspect ratio incorrecto

**Soluciones:**
1. Usar `object-cover` en lugar de `object-contain`
2. Ajustar min-height del contenedor
3. Verificar que la imagen original tenga buena resolución

---

## 📊 Métricas de Implementación

**Archivos modificados:** 6
**Archivos creados:** 3
**Migraciones:** 2 (DB + Storage)
**Líneas de código:** ~200

**Tiempo estimado para implementar:** ~2 horas
**Tiempo estimado para migrar:** ~5 minutos

---

## ✅ Checklist de Implementación

- [x] Migración de base de datos
- [x] Configuración de storage
- [x] Validaciones Zod
- [x] Server actions para upload
- [x] Formulario con preview
- [x] Página de detalle con diseño 2 columnas
- [x] Responsive design
- [x] Validación de archivo
- [x] Loading states
- [x] Error handling
- [ ] **Ejecutar migraciones en Supabase** ⚠️

---

**Estado:** ✅ Implementación completa
**Pendiente:** Ejecutar migraciones
**Testing:** Listo para probar tras migraciones
