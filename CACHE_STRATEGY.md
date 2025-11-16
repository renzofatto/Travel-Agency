# Estrategia de Caché en TravelHub

## Resumen

Se ha implementado un sistema de caché optimizado para mejorar el rendimiento de la landing page y reducir las consultas innecesarias a la base de datos.

## Configuraciones Implementadas

### 1. ISR (Incremental Static Regeneration) en Landing Page

**Archivo:** `app/page.tsx`

```typescript
export const revalidate = 3600 // Revalidar cada 1 hora (3600 segundos)
```

**Cómo funciona:**
- La landing page se genera estáticamente en el build
- Se cachea durante 1 hora
- Después de 1 hora, la próxima solicitud regenera la página en segundo plano
- Los usuarios siempre ven contenido cacheado (respuestas ultra rápidas)

**Beneficios:**
- ✅ La landing page carga instantáneamente
- ✅ No hay consultas a Supabase en cada visita
- ✅ Se actualiza automáticamente cada hora
- ✅ Contenido siempre disponible incluso si la DB está lenta

### 2. Invalidación Manual de Caché

**Archivo:** `lib/actions/package-actions.ts`

Cuando se crea o actualiza un paquete featured:

```typescript
// Invalidate landing page cache if package is featured
if (data.is_featured) {
  revalidatePath('/')
}
```

**Cómo funciona:**
- Cuando un admin crea/actualiza un paquete marcado como "featured"
- Se invalida inmediatamente el caché de la landing page
- La próxima visita regenerará la página con los datos actualizados
- No hay que esperar 1 hora para ver cambios importantes

**Beneficios:**
- ✅ Cambios críticos se reflejan inmediatamente
- ✅ Balance perfecto entre performance y frescura de datos
- ✅ Control manual para invalidar cuando sea necesario

### 3. Caché de Imágenes Optimizado

**Archivo:** `next.config.ts`

```typescript
images: {
  minimumCacheTTL: 31536000, // 1 año en segundos
}
```

**Cómo funciona:**
- Next.js optimiza y cachea todas las imágenes
- Las imágenes se cachean por 1 año completo
- Se sirven en formato WebP automáticamente
- Lazy loading por defecto

**Beneficios:**
- ✅ Imágenes cargan instantáneamente después de la primera visita
- ✅ Menor ancho de banda consumido
- ✅ Mejores Core Web Vitals (LCP, CLS)
- ✅ Imágenes optimizadas para cada dispositivo

## Resultados Esperados

### Antes (sin caché):
```
Primera visita:    ~800ms (query a Supabase + render)
Segunda visita:    ~800ms (query a Supabase + render)
Tercera visita:    ~800ms (query a Supabase + render)
```

### Después (con caché):
```
Primera visita:    ~500ms (query a Supabase + render + cache)
Segunda visita:    ~50ms  (servido desde caché)
Tercera visita:    ~50ms  (servido desde caché)
Después de 1h:     ~50ms  (caché + regeneración en background)
```

**Mejora:** ~94% más rápido después de la primera carga

## Monitoreo de Caché

### Verificar si una página está cacheada:

```bash
# Ver headers de respuesta
curl -I https://tu-dominio.com/

# Buscar estos headers:
# x-nextjs-cache: HIT (cacheado)
# x-nextjs-cache: MISS (no cacheado, primera vez)
# x-nextjs-cache: STALE (revalidando en background)
```

### Invalidar caché manualmente en desarrollo:

```bash
# Borrar todo el caché de Next.js
rm -rf .next

# Reconstruir
npm run build
```

## Consideraciones Importantes

### 1. Contenido Dinámico
- ❌ NO cachear páginas con datos de usuario específicos
- ❌ NO cachear dashboards o páginas privadas
- ✅ SÍ cachear contenido público y estático

### 2. Revalidación
- La landing page se revalida cada 1 hora
- Puedes ajustar este tiempo editando `revalidate` en `app/page.tsx`
- Tiempos recomendados:
  - Contenido que cambia poco: 3600 (1 hora) o 86400 (1 día)
  - Contenido dinámico: 60 (1 minuto) o 300 (5 minutos)
  - Landing pages: 3600 (1 hora) ✅ actual

### 3. Debugging
Si el caché causa problemas en desarrollo:

```typescript
// Deshabilitar temporalmente
export const revalidate = 0 // Deshabilita ISR
```

## Próximos Pasos (Opcional)

### 1. Caché de Otras Páginas
Puedes agregar `export const revalidate = 3600` a otras páginas públicas:
- `/paquetes/[id]` - Página de detalle de paquete
- `/grupos` - Listado de grupos públicos

### 2. CDN (Producción)
En producción con Vercel:
- El caché se sirve desde CDN global
- Latencia < 50ms en todo el mundo
- Cero costo adicional

### 3. Service Workers (PWA)
- Caché en el navegador
- Funciona offline
- Instala la app como PWA

## Recursos

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Revalidation Strategies](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data)
