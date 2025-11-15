# Resumen de Cambios: Creación de Grupos Solo para Administradores

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente la restricción de creación de grupos para que **solo los administradores** puedan crear grupos. El nuevo flujo es:

1. **Administrador** crea un grupo
2. **Administrador** opcionalmente asigna un usuario como líder (por email)
3. **Líder** gestiona el grupo (agregar/remover miembros, editar configuración)
4. **Usuarios normales** no pueden crear grupos, solo participar

## ✅ Archivos Modificados

### Base de Datos
- ✅ `supabase/rls-policies.sql` - Policy actualizada
- ✅ `supabase/migrations/restrict_group_creation_to_admins.sql` - Migración SQL

### Backend (Server Actions)
- ✅ `lib/actions/group-actions.ts`
  - Verificación de rol admin en `createGroup`
  - Parámetro `leader_email` opcional
  - Búsqueda de usuario por email
  - Asignación automática de líder
  - Rollback si falla

### Frontend (Components)
- ✅ `components/groups/group-form.tsx`
  - Campo "Leader Email" para admins
  - Prop `isAdmin` para condicional
  - Estado `leaderEmail`
  - Envío de email al crear grupo

### Frontend (Pages)
- ✅ `app/dashboard/page.tsx`
  - Verificación de rol admin
  - Botón "Create Group" solo para admins
  - Empty states diferenciados (admin vs user)
  - Mensajes contextuales por rol

- ✅ `app/dashboard/groups/new/page.tsx`
  - Verificación de admin
  - Redirección si no es admin
  - Paso de prop `isAdmin` al form

### Tests
- ✅ `__tests__/e2e/groups.spec.ts`
  - Test: Admin puede crear grupos
  - Test: Usuario normal no puede crear grupos
  - Test: Redirección de no-admins

### Documentación
- ✅ `ADMIN_GROUP_CREATION_SETUP.md` - Guía completa de instalación
- ✅ `.claude/CLAUDE.md` - Documentación actualizada
- ✅ `ADMIN_GROUP_CREATION_SUMMARY.md` - Este archivo

## 🔧 Cambios Técnicos Detallados

### 1. RLS Policy (Base de Datos)

**Antes:**
```sql
CREATE POLICY "Authenticated users can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

**Después:**
```sql
CREATE POLICY "Only admins can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (is_admin(auth.uid()));
```

### 2. Server Action (Backend)

**Cambios en `createGroup`:**

```typescript
// Nuevo parámetro
export async function createGroup(data: CreateGroupInput & { leader_email?: string })

// Nueva validación de admin
const { data: userProfile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (userProfile?.role !== 'admin') {
  return { error: 'Only administrators can create groups' }
}

// Nueva lógica de líder
if (data.leader_email) {
  const { data: leaderUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.leader_email)
    .single()

  if (!leaderUser) {
    // Rollback
    await supabase.from('travel_groups').delete().eq('id', group.id)
    return { error: 'User with that email not found' }
  }

  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: leaderUser.id,
    role: 'leader',
  })
}
```

### 3. GroupForm Component

**Nuevas adiciones:**

```typescript
interface GroupFormProps {
  mode: 'create' | 'edit'
  defaultValues?: CreateGroupInput & { id?: string }
  isAdmin?: boolean  // NUEVO
}

export default function GroupForm({ mode, defaultValues, isAdmin = false }) {
  const [leaderEmail, setLeaderEmail] = useState('')  // NUEVO

  // Campo de email (solo para admins)
  {mode === 'create' && isAdmin && (
    <div className="space-y-2">
      <label>Leader Email (Optional)</label>
      <Input
        type="email"
        placeholder="e.g., leader@example.com"
        value={leaderEmail}
        onChange={(e) => setLeaderEmail(e.target.value)}
      />
    </div>
  )}

  // Al enviar
  const result = await createGroup({ ...data, leader_email: leaderEmail || undefined })
}
```

### 4. Dashboard Page

**Cambios UI:**

```typescript
// Verificar si es admin
const { data: userProfile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

const isAdmin = userProfile?.role === 'admin'

// Botón solo para admins
{isAdmin && <CreateGroupButton />}

// Empty states diferenciados
{groupsWithCounts.length === 0 ? (
  isAdmin ? (
    <div>No groups yet. Create one to get started!</div>
  ) : (
    <div>You are not a member of any groups yet. Contact an administrator.</div>
  )
) : (
  // ...grupos
)}
```

### 5. New Group Page

**Protección de ruta:**

```typescript
export default async function NewGroupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Verificar admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  // Redirigir si no es admin
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return <GroupForm mode="create" isAdmin={isAdmin} />
}
```

## 📊 Matriz de Permisos

| Rol | Crear Grupo | Ver Grupos | Editar Grupo | Eliminar Grupo | Agregar Miembros |
|-----|-------------|------------|--------------|----------------|------------------|
| **Admin** | ✅ | ✅ (todos) | ✅ (todos) | ✅ (todos) | ✅ |
| **Leader** | ❌ | ✅ (sus grupos) | ✅ (sus grupos) | ❌ | ✅ (sus grupos) |
| **Member** | ❌ | ✅ (sus grupos) | ❌ | ❌ | ❌ |

## 🔍 Flujos de Usuario

### Flujo Admin: Crear Grupo

```
1. Dashboard → Botón "Create Group" visible
2. Click "Create Group"
3. Formulario con campos:
   - Nombre *
   - Destino *
   - Fechas *
   - Descripción
   - Imagen de portada
   - Leader Email (opcional, nuevo)
4. Submit
5. Si email válido → Usuario agregado como líder
6. Si email inválido → Error + rollback
7. Redirección a página del grupo
```

### Flujo Usuario Normal: Intentar Crear Grupo

```
1. Dashboard → Botón "Create Group" NO visible
2. Mensaje: "Contact an administrator to be added to a group"
3. Si intenta acceder a /dashboard/groups/new directamente
4. → Redirección automática a /dashboard
```

### Flujo Líder: Gestionar Grupo

```
1. Acceder a grupo donde es líder
2. Puede:
   - Agregar miembros por email
   - Remover miembros
   - Asignar/revocar rol de líder a otros
   - Editar configuración del grupo
   - Gestionar todo el contenido
3. NO puede:
   - Crear nuevos grupos
   - Eliminar el grupo
```

## 🧪 Cómo Probar

### Test 1: Admin Crea Grupo Sin Líder

```bash
1. Login como admin
2. Dashboard → "Create Group"
3. Llenar formulario sin email de líder
4. Submit
5. ✅ Grupo creado sin miembros
```

### Test 2: Admin Crea Grupo Con Líder

```bash
1. Login como admin
2. Dashboard → "Create Group"
3. Llenar formulario con email de líder válido
4. Submit
5. ✅ Grupo creado
6. ✅ Usuario agregado como líder
7. Verificar en página de miembros
```

### Test 3: Admin Crea Grupo Con Email Inválido

```bash
1. Login como admin
2. Dashboard → "Create Group"
3. Llenar formulario con email inexistente
4. Submit
5. ❌ Error: "User with that email not found"
6. ✅ Grupo NO creado (rollback)
```

### Test 4: Usuario Normal No Puede Crear

```bash
1. Login como usuario normal
2. Dashboard → Botón "Create Group" NO visible
3. Intentar acceder a /dashboard/groups/new
4. ✅ Redirección a /dashboard
```

### Test 5: RLS Policy Funciona

```sql
-- Como usuario normal (conectado)
INSERT INTO travel_groups (name, destination, start_date, end_date, created_by)
VALUES ('Test', 'Test', '2025-12-01', '2025-12-10', auth.uid());

-- ❌ Error: new row violates row-level security policy
```

## 📦 Instalación (Para Producción)

### 1. Aplicar Migración SQL

```bash
# En Supabase Dashboard → SQL Editor
# Ejecutar: supabase/migrations/restrict_group_creation_to_admins.sql
```

### 2. Verificar Usuario Admin

```sql
-- Crear al menos un admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu_email@example.com';
```

### 3. Deploy Código

```bash
git pull origin main
npm install  # Si hay nuevas dependencias
npm run build
npm run start  # O tu comando de producción
```

## 🔄 Rollback (Si es Necesario)

### Base de Datos

```sql
-- Volver a permitir a todos crear grupos
DROP POLICY IF EXISTS "Only admins can create groups" ON public.travel_groups;

CREATE POLICY "Authenticated users can create groups"
  ON public.travel_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Código

```bash
git revert HEAD
git push origin main
```

## 📝 Notas Importantes

1. **⚠️ Asegurar Admin**: Antes de aplicar la migración, ASEGÚRATE de tener al menos un usuario con rol 'admin'

2. **Grupos Existentes**: No se ven afectados. Los miembros actuales mantienen sus roles y permisos

3. **Líder Opcional**: El admin puede crear un grupo sin líder y agregarlo después manualmente

4. **Múltiples Líderes**: Un grupo puede tener múltiples líderes. El admin o un líder puede promover a otros miembros

5. **Email Válido**: El email del líder debe corresponder a un usuario registrado en la plataforma

6. **Admin como Líder**: Si un admin quiere ser líder de su propio grupo, debe poner su propio email

## 🎯 Beneficios

- ✅ **Control centralizado**: Solo admins gestionan la creación de grupos
- ✅ **Delegación clara**: Admins delegan gestión a líderes
- ✅ **Separación de roles**: Admin ≠ Líder ≠ Miembro
- ✅ **Flexibilidad**: Líder puede agregar miembros libremente
- ✅ **Seguridad**: RLS enforced a nivel de base de datos

## 📚 Documentación Relacionada

- `ADMIN_GROUP_CREATION_SETUP.md` - Guía completa de instalación
- `.claude/CLAUDE.md` - Documentación del agente
- `supabase/rls-policies.sql` - Todas las políticas RLS
- `__tests__/e2e/groups.spec.ts` - Tests E2E

---

**Implementado**: 2025-11-15
**Autor**: Claude Code
**Estado**: ✅ Completo y Documentado
