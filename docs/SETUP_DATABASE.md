# Setup de Base de Datos - TravelHub

## 🎯 Objetivo

Esta guía te ayudará a configurar la base de datos completa de TravelHub ejecutando **solo 2 scripts SQL**.

## 📋 Scripts a Ejecutar (en orden)

### 1️⃣ Schema Completo con RLS (`supabase/schema.sql`)

**Qué hace**: Crea TODAS las tablas, funciones, triggers, índices Y políticas RLS

**Contenido consolidado**:
- ✅ 15 tablas (users, groups, expenses, packages, etc.)
- ✅ 7 custom types (enums)
- ✅ 3 funciones helper (is_admin, is_group_member, is_group_leader)
- ✅ 10+ triggers para updated_at
- ✅ Todos los índices para performance
- ✅ Todas las constraints y checks
- ✅ **TODAS las políticas RLS ya incluidas**

**Tiempo**: ~10 segundos

**Cómo ejecutar**:
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega TODO el contenido de `supabase/schema.sql`
3. Click en "Run"

---

### 2️⃣ Storage Buckets (`supabase/storage-buckets.sql`)

**Qué hace**: Crea TODOS los buckets de almacenamiento y sus políticas

**Buckets creados**:
- ✅ `avatars` (público) - Avatares de usuarios
- ✅ `travel-documents` (privado) - Documentos de viaje
- ✅ `photos` (público) - Fotos de grupos
- ✅ `itinerary-item-images` (público) - Imágenes de itinerario

**Tiempo**: ~3 segundos

**Cómo ejecutar**:
1. Ve a Supabase Dashboard → SQL Editor
2. Copia y pega TODO el contenido de `supabase/storage-buckets.sql`
3. Click en "Run"

---

## ✅ Verificación

Después de ejecutar los 3 scripts, verifica:

### Tablas Creadas (15 total)

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Deberías ver**:
```
expense_payments
expense_splits
expenses
group_members
group_notes
itinerary_items
package_excluded_items
package_included_items
package_itinerary_items
photo_comments
photos
travel_documents
travel_groups
travel_packages
users
```

### RLS Habilitado

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Todas deberían tener** `rowsecurity = true`

### Storage Buckets

```sql
SELECT name, public FROM storage.buckets ORDER BY name;
```

**Deberías ver**:
```
avatars                | true
itinerary-item-images  | true
photos                 | true
travel-documents       | false
```

---

## 👤 Crear Primer Usuario Admin

### Paso 1: Registrar usuario en la app

1. Ve a http://localhost:3000/auth/register
2. Registra tu usuario admin

### Paso 2: Promover a admin

```sql
-- Reemplaza con tu email
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';

-- Verificar
SELECT email, role FROM public.users;
```

---

## 🚨 Troubleshooting

### Error: "type already exists"

**Causa**: Los tipos ya existen de una ejecución anterior

**Solución**: Los scripts usan `IF NOT EXISTS` y `ON CONFLICT`, es seguro ejecutarlos múltiples veces

### Error: "relation already exists"

**Causa**: Las tablas ya existen

**Solución**: Está todo bien, las tablas ya están creadas. Continúa con el siguiente script.

### Error: "permission denied"

**Causa**: RLS está bloqueando

**Solución**:
1. Verifica que ejecutaste el script de RLS policies
2. Verifica que tu usuario tenga el rol correcto
3. Para debugging temporal, puedes deshabilitar RLS:
   ```sql
   ALTER TABLE nombre_tabla DISABLE ROW LEVEL SECURITY;
   ```

### Error: "bucket already exists"

**Causa**: El bucket ya fue creado

**Solución**: Los scripts usan `ON CONFLICT DO NOTHING`, es seguro re-ejecutar

---

## 📂 Carpeta `migrations-backup/`

La carpeta `supabase/migrations-backup/` contiene las migraciones individuales originales.

**NO necesitas ejecutarlas** - todo ya está consolidado en `schema.sql`.

Se mantienen como backup por si necesitas revisar el historial de cambios.

---

## 🎯 Resumen

| Script | Ejecutar | Qué Crea |
|--------|----------|----------|
| `schema.sql` | ✅ Sí | 15 tablas + funciones + triggers + RLS |
| `storage-buckets.sql` | ✅ Sí | 4 buckets con sus políticas |
| `migrations-backup/*` | ❌ No | Ya consolidado en schema.sql |

**Total de tiempo**: ~15 segundos
**Total de archivos**: 2 (antes eran 13)

---

## 🚀 Siguiente Paso

Una vez ejecutados los 3 scripts:
1. Crea tu usuario admin (ver arriba)
2. Ejecuta `npm run dev`
3. Inicia sesión en http://localhost:3000
4. Ya puedes crear grupos, paquetes, etc.

---

**¿Problemas?** Revisa [docs/MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) para más detalles
