# Checklist de Migraciones - TravelHub

Esta guía te ayudará a ejecutar todas las migraciones necesarias en Supabase para tener el proyecto completamente funcional.

## 🗄️ Migraciones de Base de Datos

### 1. Schema Base (Requerido)

**Archivo**: `supabase/schema.sql`

Crea todas las tablas principales del sistema.

**Orden de ejecución**: 1

```sql
-- Ejecutar en Supabase SQL Editor
-- Copiar y pegar el contenido completo de supabase/schema.sql
```

**Qué crea:**
- Tabla `users` con trigger de creación automática
- Tabla `travel_groups` con función de crear nota automática
- Tablas de relaciones: `group_members`, `itinerary_items`, etc.
- Funciones helper: `is_admin()`, `is_group_member()`, `is_group_leader()`
- Índices para optimización
- Triggers para timestamps

---

### 2. RLS Policies (Requerido)

**Archivo**: `supabase/rls-policies.sql`

Configura todas las políticas de seguridad Row Level Security.

**Orden de ejecución**: 2

```sql
-- Ejecutar en Supabase SQL Editor
-- Copiar y pegar el contenido completo de supabase/rls-policies.sql
```

**Qué crea:**
- RLS policies para todas las tablas
- Permisos basados en roles (admin, leader, member)
- Protección de datos por grupo

---

### 3. Travel Packages System (Requerido para Landing Page)

**Archivo**: `supabase/migrations/create_travel_packages.sql`

Crea el sistema de paquetes de viaje para la landing page.

**Orden de ejecución**: 3

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué crea:**
- Tabla `travel_packages`
- Tabla `package_itinerary_items`
- RLS policies para paquetes
- Relación con grupos

---

### 4. Coordinates for Itinerary (Requerido para Mapas)

**Archivo**: `supabase/migrations/add_coordinates_to_itinerary.sql`

Agrega soporte para ubicaciones geográficas en el itinerario.

**Orden de ejecución**: 4

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué hace:**
- Agrega columnas `latitude` y `longitude` a `package_itinerary_items`
- Agrega constraints para validar coordenadas (-90 a 90, -180 a 180)
- Crea comentarios en columnas

---

### 5. Images for Itinerary Items (Requerido para Fotos)

**Archivo**: `supabase/migrations/add_image_to_itinerary_items.sql`

Permite agregar imágenes a cada actividad del itinerario.

**Orden de ejecución**: 5

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué hace:**
- Agrega columna `image_url` a `package_itinerary_items`
- Crea índice para queries de imágenes
- Agrega comentario

---

### 6. Package Includes/Excludes (Requerido para Paquetes)

**Archivo**: `supabase/migrations/add_package_includes_excludes.sql`

Sistema completo de items incluidos/excluidos para paquetes.

**Orden de ejecución**: 6

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué crea:**
- Tabla `package_included_items`
- Tabla `package_excluded_items`
- Índices para ordenamiento
- RLS policies (admin write, public read)
- Triggers para `updated_at`

---

### 7. Restrict Group Creation (Importante)

**Archivo**: `supabase/migrations/restrict_group_creation_to_admins.sql`

Solo administradores pueden crear grupos.

**Orden de ejecución**: 7

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué hace:**
- Actualiza RLS policy de `travel_groups`
- Solo admins pueden hacer INSERT
- Leaders pueden hacer UPDATE/DELETE

---

## 💾 Migraciones de Storage

### 1. Storage Setup (Requerido)

**Archivo**: `supabase/storage/storage-setup.sql`

Configura los buckets principales y sus políticas.

**Orden de ejecución**: Después de schema base

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué crea:**
- Bucket `travel-documents` (privado)
- Bucket `photos` (público)
- Bucket `avatars` (público)
- RLS policies para cada bucket

---

### 2. Itinerary Images Bucket (Requerido para Imágenes)

**Archivo**: `supabase/storage/itinerary-images-bucket.sql`

Bucket para imágenes de actividades del itinerario.

**Orden de ejecución**: Después de storage-setup.sql

```sql
-- Ejecutar en Supabase SQL Editor
```

**Qué crea:**
- Bucket `itinerary-item-images` (público)
- RLS policies (admins upload, public view)

---

## ✅ Checklist de Ejecución

### Fase 1: Base de Datos

- [ ] 1. Ejecutar `supabase/schema.sql`
- [ ] 2. Ejecutar `supabase/rls-policies.sql`
- [ ] 3. Verificar que las tablas se crearon correctamente

**Verificación:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Deberías ver: users, travel_groups, group_members, etc.
```

### Fase 2: Features Adicionales

- [ ] 4. Ejecutar `create_travel_packages.sql`
- [ ] 5. Ejecutar `add_coordinates_to_itinerary.sql`
- [ ] 6. Ejecutar `add_image_to_itinerary_items.sql`
- [ ] 7. Ejecutar `add_package_includes_excludes.sql`
- [ ] 8. Ejecutar `restrict_group_creation_to_admins.sql`

**Verificación:**
```sql
-- Verificar columnas nuevas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'package_itinerary_items'
ORDER BY ordinal_position;
-- Deberías ver: latitude, longitude, image_url
```

### Fase 3: Storage

- [ ] 9. Ejecutar `storage/storage-setup.sql`
- [ ] 10. Ejecutar `storage/itinerary-images-bucket.sql`

**Verificación:**
```sql
-- Verificar buckets creados
SELECT name, public FROM storage.buckets ORDER BY name;
-- Deberías ver: avatars, itinerary-item-images, photos, travel-documents
```

### Fase 4: Crear Usuario Admin

- [ ] 11. Registrar primer usuario en la app
- [ ] 12. Promover a admin manualmente

**SQL para promover a admin:**
```sql
-- Reemplaza 'user-email@example.com' con el email real
UPDATE public.users
SET role = 'admin'
WHERE email = 'user-email@example.com';
```

**Verificación:**
```sql
SELECT id, email, full_name, role FROM public.users;
-- El usuario debería tener role = 'admin'
```

---

## 🚨 Troubleshooting

### Error: "relation does not exist"

**Causa**: No ejecutaste el schema base o hubo un error.

**Solución**:
1. Verifica que no haya errores en el SQL Editor
2. Ejecuta `supabase/schema.sql` nuevamente
3. Si persiste, elimina todas las tablas y vuelve a empezar

### Error: "policy for table does not exist"

**Causa**: RLS policies no se ejecutaron correctamente.

**Solución**:
1. Ejecuta `DROP POLICY IF EXISTS ...` para cada policy
2. Ejecuta `supabase/rls-policies.sql` nuevamente

### Error: "bucket does not exist"

**Causa**: Storage buckets no se crearon.

**Solución**:
1. Ve a Storage en Supabase dashboard
2. Verifica que los buckets existan
3. Si no existen, ejecuta los scripts de storage nuevamente

### Error: "permission denied for table"

**Causa**: RLS está bloqueando el acceso.

**Solución**:
1. Verifica que el usuario tenga el rol correcto (admin/user)
2. Verifica que las RLS policies estén activas
3. Para debugging, puedes deshabilitar RLS temporalmente:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

---

## 📊 Verificación Final

Después de ejecutar todas las migraciones, verifica:

```sql
-- 1. Contar tablas (deberías tener 15)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. Verificar RLS habilitado en todas las tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Todas deberían tener rowsecurity = true

-- 3. Verificar storage buckets (deberías tener 4)
SELECT COUNT(*) FROM storage.buckets;

-- 4. Verificar funciones helper
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'is_%';
-- Deberías ver: is_admin, is_group_member, is_group_leader
```

---

## 🎯 Orden Recomendado (Resumen)

1. `schema.sql` - Base de datos
2. `rls-policies.sql` - Seguridad
3. `create_travel_packages.sql` - Paquetes
4. `add_coordinates_to_itinerary.sql` - Coordenadas
5. `add_image_to_itinerary_items.sql` - Imágenes
6. `add_package_includes_excludes.sql` - Incluidos/Excluidos
7. `restrict_group_creation_to_admins.sql` - Admin-only grupos
8. `storage-setup.sql` - Storage buckets
9. `itinerary-images-bucket.sql` - Bucket de imágenes
10. Crear usuario admin manualmente

---

**Tiempo estimado total**: 10-15 minutos

**Estado**: Listo para producción una vez completadas todas las migraciones

**Última actualización**: 2025-11-15
