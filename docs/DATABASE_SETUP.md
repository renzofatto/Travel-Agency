# Configuración de Base de Datos - TravelHub

**Última actualización**: 2025-11-15

## 🎯 Overview

La configuración de la base de datos de TravelHub ahora es **extremadamente simple**. Solo necesitas ejecutar **2 archivos SQL** en Supabase y listo.

## ⚡ Setup Rápido (5 minutos)

### Prerequisitos
- Cuenta de Supabase (gratis)
- Proyecto creado en Supabase

### Paso 1: Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Paso 2: Ejecutar Schema de Base de Datos

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido de `supabase/schema.sql`
3. Click en **Run** o `Ctrl + Enter`

**Tiempo estimado**: 2 minutos

Este archivo crea:
- ✅ 15 tablas con todas sus relaciones
- ✅ 50+ índices para optimización
- ✅ 4 funciones helper
- ✅ 11 triggers para auto-updates
- ✅ Todas las RLS policies de seguridad
- ✅ 6 custom types (ENUMs)

### Paso 3: Configurar Storage Buckets

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `supabase/storage-buckets.sql`
3. Click en **Run** o `Ctrl + Enter`

**Tiempo estimado**: 1 minuto

Este archivo crea:
- ✅ 7 storage buckets configurados
- ✅ 28 RLS policies para storage
- ✅ Configuración de público/privado
- ✅ Permisos por rol (admin, leader, member)

### Paso 4: Crear Usuario Admin

1. Registra el primer usuario en tu app
2. Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Reemplaza con tu email
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu-email@example.com';
```

### ✅ Listo!

Tu base de datos está completamente configurada. Puedes empezar a usar la app.

---

## 📋 Archivos SQL

### `supabase/schema.sql`
**Líneas**: 1,043
**Qué incluye**: TODO el schema de la base de datos

Este archivo es la **consolidación completa** de:
- Schema base original
- 9 migraciones históricas
- Todas las RLS policies
- Funciones y triggers

**Resultado**: Una base de datos completamente funcional con:
- 15 tablas
- 50+ índices
- 4 funciones
- 11 triggers
- 70+ RLS policies
- 6 custom types

### `supabase/storage-buckets.sql`
**Líneas**: 417
**Qué incluye**: Configuración completa de Storage

Este archivo crea:
- 7 storage buckets
- 28 RLS policies para storage
- Permisos granulares por rol

**Buckets creados**:
1. `avatars` (público) - Avatares de usuarios
2. `travel-documents` (privado) - Documentos de viaje
3. `photos` (público) - Fotos de viaje
4. `itinerary-item-images` (público) - Imágenes de actividades
5. `group-covers` (público) - Portadas de grupos
6. `package-covers` (público) - Portadas de paquetes
7. `receipts` (privado) - Recibos de gastos

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales (15 total)

| # | Tabla | Descripción | Relaciones |
|---|-------|-------------|------------|
| 1 | `users` | Perfiles de usuarios | Extiende auth.users |
| 2 | `travel_groups` | Grupos de viaje | created_by → users |
| 3 | `group_members` | Membresía de grupos | group_id → groups, user_id → users |
| 4 | `travel_packages` | Paquetes predefinidos | created_by → users |
| 5 | `package_itinerary_items` | Itinerario de paquetes | package_id → packages |
| 6 | `package_included_items` | Lo que incluye paquete | package_id → packages |
| 7 | `package_excluded_items` | Lo que NO incluye | package_id → packages |
| 8 | `itinerary_items` | Actividades de grupos | group_id → groups |
| 9 | `expenses` | Gastos compartidos | group_id → groups, paid_by → users |
| 10 | `expense_splits` | División de gastos | expense_id → expenses, user_id → users |
| 11 | `expense_payments` | Pagos entre miembros | group_id → groups |
| 12 | `travel_documents` | Documentos | group_id → groups |
| 13 | `photos` | Galería de fotos | group_id → groups |
| 14 | `photo_comments` | Comentarios en fotos | photo_id → photos |
| 15 | `group_notes` | Notas colaborativas | group_id → groups |

### Custom Types (ENUMs)

```sql
user_role: 'admin', 'user'
group_member_role: 'leader', 'member'
itinerary_category: 'transport', 'accommodation', 'activity', 'food', 'other'
document_type: 'flight', 'bus', 'train', 'hotel', 'activity', 'other'
expense_split_type: 'equal', 'percentage', 'custom'
expense_category: 'transport', 'accommodation', 'food', 'activity', 'shopping', 'other'
```

---

## 🔐 Sistema de Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

**Nivel Global:**
- `is_admin(user_id)` - Verifica si es admin
- `is_group_member(user_id, group_id)` - Verifica membresía
- `is_group_leader(user_id, group_id)` - Verifica liderazgo

**Políticas por Tabla:**
- **Grupos**: Solo admins crean, leaders/admins editan
- **Miembros**: Leaders/admins gestionan
- **Itinerarios**: Miembros crean, todos ven
- **Gastos**: Miembros crean/editan sus gastos
- **Documentos**: Miembros suben, owners/admins eliminan
- **Fotos**: Miembros suben, owners/admins eliminan
- **Notas**: Miembros crean/editan, owners/admins eliminan
- **Paquetes**: Solo admins gestionan

### Storage Security

**Buckets Públicos** (cualquiera puede ver):
- avatars
- photos
- itinerary-item-images
- group-covers
- package-covers

**Buckets Privados** (solo miembros del grupo):
- travel-documents
- receipts

**Permisos de Upload:**
- Avatars: Solo el usuario puede subir/editar su avatar
- Documents: Miembros del grupo
- Photos: Miembros del grupo
- Itinerary images: Solo admins
- Group covers: Leaders y admins
- Package covers: Solo admins
- Receipts: Usuario que creó el gasto

---

## ✅ Verificación

### Verificar Tablas Creadas

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Debería retornar 15 tablas
```

### Verificar RLS Habilitado

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas deberían tener rowsecurity = true
```

### Verificar Funciones Helper

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'is_%';

-- Debería retornar: is_admin, is_group_member, is_group_leader
```

### Verificar Storage Buckets

```sql
SELECT id, name, public
FROM storage.buckets
ORDER BY name;

-- Debería retornar 7 buckets
```

### Verificar Políticas de Storage

```sql
SELECT COUNT(*)
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';

-- Debería retornar 28 policies
```

---

## 🔄 Reset de Base de Datos

Si necesitas reiniciar desde cero:

### Opción 1: Supabase CLI (Recomendado)

```bash
supabase db reset
```

### Opción 2: Manual

1. Ve a **SQL Editor** en Supabase
2. Ejecuta:

```sql
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Drop all storage policies
DELETE FROM storage.objects WHERE true;
DELETE FROM storage.buckets WHERE true;
```

3. Ejecuta `schema.sql` nuevamente
4. Ejecuta `storage-buckets.sql` nuevamente

---

## 📊 Índices y Performance

El schema incluye **50+ índices** para optimizar queries comunes:

**Índices en travel_groups:**
- `idx_travel_groups_created_by` - Grupos por creador
- `idx_travel_groups_dates` - Búsqueda por fechas

**Índices en group_members:**
- `idx_group_members_user` - Grupos de un usuario
- `idx_group_members_group` - Miembros de un grupo

**Índices en itinerary_items:**
- `idx_itinerary_date` - Actividades por fecha
- `idx_itinerary_group` - Actividades de un grupo

**Índices en expenses:**
- `idx_expenses_group` - Gastos de un grupo
- `idx_expenses_paid_by` - Gastos pagados por usuario

Y muchos más...

---

## 🐛 Troubleshooting

### Error: "extension uuid-ossp does not exist"

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied for schema public"

**Solución**: Verifica que tu usuario tenga permisos en el schema public:
```sql
GRANT ALL ON SCHEMA public TO your_user;
```

### Error: "type already exists"

**Solución**: Los ENUMs ya existen. Puedes ignorar o ejecutar:
```sql
DROP TYPE IF EXISTS user_role CASCADE;
-- Repite para cada tipo
```

### Error: "table already exists"

**Solución**: Si quieres empezar desde cero, ejecuta el reset (ver sección anterior).

---

## 📚 Referencias

- **Schema completo**: `supabase/schema.sql`
- **Storage setup**: `supabase/storage-buckets.sql`
- **Migraciones históricas**: `supabase/migrations-backup/` (solo referencia)

---

**¿Preguntas?** Revisa [QUICK_START.md](QUICK_START.md) o abre un issue en GitHub.
