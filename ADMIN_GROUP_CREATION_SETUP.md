# Configuración: Solo Administradores Pueden Crear Grupos

## Resumen de Cambios

Esta migración cambia el flujo de creación de grupos para que **solo los administradores** puedan crear grupos. El flujo ahora es:

1. **Admin** crea un grupo
2. **Admin** agrega un usuario por email como líder (opcional)
3. **Líder** puede agregar/eliminar miembros y gestionar el grupo
4. **Miembros** solo pueden ver y usar el grupo, no crearlo

## Cambios Realizados

### 1. Base de Datos (RLS Policies)
- ✅ Solo admins pueden crear grupos (antes: cualquier usuario autenticado)
- ✅ Líderes y admins pueden actualizar grupos
- ✅ Solo admins pueden eliminar grupos
- ✅ Miembros pueden ver sus grupos

### 2. Backend (Server Actions)
- ✅ `createGroup` verifica que el usuario sea admin
- ✅ `createGroup` acepta `leader_email` opcional
- ✅ Si se proporciona email, busca al usuario y lo agrega como líder
- ✅ Rollback automático si falla agregar líder

### 3. Frontend (UI)
- ✅ Botón "Create Group" solo visible para admins
- ✅ Formulario incluye campo "Leader Email" para admins
- ✅ Página `/dashboard/groups/new` redirige a no-admins
- ✅ Empty state diferente para admins vs usuarios

## Instrucciones de Instalación

### Paso 1: Aplicar Migración SQL

Ve al dashboard de Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

Ejecuta el siguiente SQL:

```sql
-- ============================================
-- MIGRATION: Restrict Group Creation to Admins Only
-- Date: 2025-11-15
-- ============================================

-- Drop the old policy that allows any authenticated user to create groups
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.travel_groups;

-- Create new policy: Only admins can create groups
CREATE POLICY "Only admins can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (is_admin(auth.uid()));
```

**Nota**: Esto usa la función helper `is_admin(user_id)` que ya está creada en tu base de datos.

### Paso 2: Verificar que Tienes un Usuario Admin

```sql
-- Ver todos los usuarios y sus roles
SELECT id, email, full_name, role FROM public.users;

-- Si no tienes ningún admin, convierte tu usuario en admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'TU_EMAIL@example.com';
```

**⚠️ IMPORTANTE**: Asegúrate de tener al menos un usuario con rol 'admin' antes de aplicar la migración, o no podrás crear grupos.

### Paso 3: Reiniciar la Aplicación

Los cambios en el frontend ya están aplicados. Solo necesitas:

```bash
# Si la app está corriendo, reiniciar Next.js
# Ctrl+C y luego:
npm run dev
```

## Cómo Usar el Nuevo Flujo

### Para Administradores

1. Ir al dashboard: `/dashboard`
2. Hacer clic en "Create Group"
3. Llenar el formulario:
   - Nombre del grupo
   - Destino
   - Fechas
   - Descripción (opcional)
   - **Leader Email** (opcional): Email del usuario que será líder
4. Hacer clic en "Create Group"

**Notas**:
- Si proporcionas un email de líder, ese usuario debe estar registrado primero
- Si no proporcionas email, puedes agregar un líder más tarde desde la página del grupo
- El administrador NO es automáticamente miembro del grupo

### Para Líderes

1. Recibir acceso al grupo (asignado por admin)
2. Agregar/remover miembros
3. Editar configuración del grupo
4. Gestionar itinerario, gastos, fotos, etc.

### Para Usuarios Normales

1. Ser agregados a un grupo por el líder
2. Ver y participar en el grupo
3. NO pueden crear grupos
4. Dashboard muestra: "Contact an administrator to be added to a group"

## Verificación

### Test 1: Usuario Normal No Puede Crear Grupos

```bash
# Como usuario normal (no admin):
# 1. Ir a /dashboard
# 2. Verificar que NO aparece el botón "Create Group"
# 3. Intentar acceder a /dashboard/groups/new
# 4. Debe redirigir a /dashboard
```

### Test 2: Admin Puede Crear Grupos

```bash
# Como admin:
# 1. Ir a /dashboard
# 2. Hacer clic en "Create Group"
# 3. Ver campo "Leader Email"
# 4. Crear grupo sin email de líder → Éxito
# 5. Crear grupo con email válido → Éxito, usuario agregado como líder
# 6. Crear grupo con email inválido → Error: "User with that email not found"
```

### Test 3: RLS Policy Funciona

```sql
-- Como usuario normal, intentar crear grupo:
-- Esto debe fallar con error de permisos
INSERT INTO public.travel_groups (name, destination, start_date, end_date, created_by)
VALUES ('Test', 'Test', '2025-12-01', '2025-12-10', auth.uid());
-- Error: new row violates row-level security policy

-- Como admin, mismo query debe funcionar
```

## Rollback (Si Algo Sale Mal)

Si necesitas volver al sistema anterior donde cualquiera puede crear grupos:

```sql
-- Drop the admin-only policy
DROP POLICY IF EXISTS "Only admins can create groups" ON public.travel_groups;

-- Re-create the old policy
CREATE POLICY "Authenticated users can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

Luego revertir los cambios en el código con:
```bash
git revert HEAD
```

## Archivos Modificados

- `supabase/migrations/restrict_group_creation_to_admins.sql` - Migración SQL
- `supabase/rls-policies.sql` - RLS policy actualizada
- `lib/actions/group-actions.ts` - Verificación de admin + leader_email
- `components/groups/group-form.tsx` - Campo de email de líder
- `app/dashboard/page.tsx` - Botón solo para admins
- `app/dashboard/groups/new/page.tsx` - Protección de ruta

## Próximos Pasos Opcionales

1. **Email notifications**: Notificar al líder cuando es asignado
2. **Bulk group creation**: Crear múltiples grupos desde CSV
3. **Group templates**: Plantillas predefinidas para tipos de viaje
4. **Leader invitation**: Enviar invitación por email si usuario no existe

## Preguntas Frecuentes

**P: ¿Qué pasa si un admin quiere ser líder de su propio grupo?**
R: El admin debe poner su propio email en el campo "Leader Email" al crear el grupo.

**P: ¿Puede un grupo no tener líderes?**
R: Sí, el admin puede crear un grupo sin líder y agregarlo después.

**P: ¿Puede haber múltiples líderes en un grupo?**
R: Sí, el admin o un líder existente puede agregar más líderes desde la página de miembros.

**P: ¿Los líderes pueden crear grupos?**
R: No, solo administradores pueden crear grupos.

**P: ¿Qué pasa con los grupos existentes?**
R: No se ven afectados. Solo afecta la creación de nuevos grupos.

---

**Fecha de implementación**: 2025-11-15
**Autor**: Claude Code
**Versión**: 1.0
