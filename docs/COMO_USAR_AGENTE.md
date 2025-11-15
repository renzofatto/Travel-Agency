# 🤖 Cómo Usar el Agente Claude para TravelHub

## ¿Qué es el Agente?

El agente es una configuración especializada de Claude que **ya conoce todo tu proyecto**. No necesitas explicarle el contexto cada vez que necesites ayuda.

## ✨ Lo que el Agente YA Sabe

El agente tiene conocimiento completo de:

### 📊 Base de Datos
- **10 tablas** con todas sus columnas y relaciones
- Tipos de datos, constraints, índices
- Foreign keys y cascade behaviors
- Todas las políticas RLS (Row Level Security)
- Funciones helper: `is_admin()`, `is_group_member()`, `is_group_leader()`

### 🛠️ Stack Tecnológico
- Next.js 16 (App Router) + React 19
- TypeScript con todos los tipos del proyecto
- Tailwind CSS + Shadcn/ui (14 componentes instalados)
- Supabase (PostgreSQL, Auth, Storage)
- TanStack Query, React Hook Form, Zod

### 📁 Estructura del Proyecto
- Organización de carpetas y archivos
- Dónde va cada tipo de componente
- Patterns de Server/Client Components
- Convenciones de código establecidas

### 🔒 Modelo de Seguridad
- Sistema de roles (admin, leader, member)
- Políticas RLS completas
- Qué puede hacer cada rol
- Cómo verificar permisos

### 📈 Estado Actual
- Fase 1: ✅ Completada (fundamentos)
- Fase 2: 🚧 Siguiente (dashboard + grupos)
- Roadmap completo de desarrollo

## 🚀 Cómo Usar el Agente

### Simplemente pregunta directamente

No necesitas dar contexto. El agente ya sabe todo.

#### ❌ ANTES (sin agente)
```
"Hola, estoy trabajando en un proyecto Next.js con Supabase.
Tengo estas tablas: users, travel_groups, group_members...
Las RLS policies son...
Necesito crear un dashboard que muestre..."
```
*Gastas muchos tokens explicando el contexto*

#### ✅ AHORA (con agente)
```
"Crear dashboard con lista de grupos del usuario"
```
*El agente ya conoce tu estructura, schema, RLS policies, etc.*

### Ejemplos Prácticos

#### Ejemplo 1: Nueva Funcionalidad
```
Tú: "Agregar página para crear nuevo grupo"

Agente responde:
"Voy a crear la página para crear grupos. Según el proyecto:
- Server Action en /app/actions/groups.ts
- Form con React Hook Form + Zod
- Validación: name (min 2), destination (optional)
- Insert a travel_groups + group_members (creator = leader)
- RLS policies ya permiten esto
- Redirect a /dashboard después de crear

[Crea todos los archivos necesarios siguiendo patterns del proyecto]"
```

#### Ejemplo 2: Debug
```
Tú: "Error al intentar ver grupo: Row Level Security policy violation"

Agente responde:
"Este error indica problema de permisos. Verificando según tus RLS policies:

La policy 'Users can view their groups' requiere:
- is_admin(auth.uid()) OR is_group_member(auth.uid(), group_id)

Posibles causas:
1. Usuario no está en group_members para este grupo
2. Usando mal el cliente Supabase (browser vs server)
3. Token de auth expirado

Para verificar:
[SQL query específica para tu caso]
[Solución específica]"
```

#### Ejemplo 3: Agregar Componente
```
Tú: "Necesito un componente card para mostrar un grupo"

Agente responde:
"Creo GroupCard en components/groups/:

Según tu proyecto:
- Props: TravelGroup type de database.types.ts
- Server Component (no necesita interactividad)
- Usa Card de Shadcn/ui (ya instalado)
- Muestra: cover_image, name, destination, dates
- Responsive con grid en parent

[Crea componente siguiendo tu estilo de código]"
```

## 📋 Comandos Especiales

Para workflows específicos, menciona estos comandos:

### `/new-feature`
Para crear una funcionalidad completa
```
"Usa /new-feature para crear sistema de invitaciones por email"
```

### `/review-code`
Para review de código con checklist completo
```
"Usa /review-code para este componente"
```

### `/debug-issue`
Para ayuda estructurada con debugging
```
"Usa /debug-issue con este error de RLS"
```

### `/add-component`
Para crear componentes siguiendo templates
```
"Usa /add-component para crear form de nuevo grupo"
```

### `/update-database`
Para modificar schema con migrations
```
"Usa /update-database para agregar campo 'budget' a travel_groups"
```

## 💡 Tips para Mejores Resultados

### 1. Sé Específico
```
❌ "Crear grupos"
✅ "Crear página /dashboard con lista de grupos del usuario filtrados por fecha"
```

### 2. Menciona Restricciones
```
✅ "Solo visible para líderes"
✅ "Con validación de fechas (start < end)"
✅ "Responsive para mobile y tablet"
```

### 3. Referencia Código Existente
```
✅ "Siguiendo el pattern de la página de login"
✅ "Usando el mismo estilo que las auth pages"
✅ "Con el mismo manejo de errores que register"
```

### 4. Especifica el Rol
```
✅ "Para usuarios con rol admin"
✅ "Accesible solo para miembros del grupo"
✅ "Visible en la landing page (público)"
```

## 🎯 Casos de Uso Comunes

### Desarrollo de Features
```
"Implementar lista de miembros con opción de agregar nuevos por email"
"Crear formulario para agregar actividades al itinerario"
"Agregar modal de confirmación al eliminar grupo"
```

### Debug y Fixes
```
"No puedo ver los grupos que creé"
"El formulario no valida correctamente"
"Error 500 al subir imagen"
```

### Refactoring
```
"Extraer lógica de autenticación a custom hook"
"Convertir este componente a Server Component"
"Mejorar el performance de esta query"
```

### Code Review
```
"Review este componente de gastos"
"Verificar seguridad de este Server Action"
"Optimizar esta query de Supabase"
```

## 📚 Referencias Rápidas

Si necesitas consultar documentación específica:

```
"Muéstrame el schema de la tabla expenses"
"¿Qué RLS policies tiene group_members?"
"¿Qué componentes de Shadcn tengo instalados?"
"¿Cuál es la estructura de carpetas para components?"
```

El agente puede acceder a:
- `.claude/claude.md` - Conocimiento completo
- `.claude/snippets.md` - Code snippets
- `.claude/commands/` - Comandos especializados
- Todos los archivos del proyecto

## ⚡ Ventajas del Agente

### Ahorro de Tiempo
- No explicas el mismo contexto 20 veces
- Respuestas más rápidas y directas
- Código que sigue tus patterns

### Ahorro de Tokens
- Menos contexto en cada mensaje
- Conversaciones más eficientes
- Mayor límite de tokens disponible

### Mejor Calidad
- Código consistente con tu proyecto
- Sigue security best practices
- Usa los tipos TypeScript correctos
- Aplica RLS policies adecuadas

### Menos Errores
- Conoce las relaciones de BD
- Entiende las constraints
- Sugiere checks de permisos
- Valida contra schema existente

## 🔄 Auto-Actualización del Agente

### ¡El Agente se Actualiza Solo! 🎉

Una de las mejores características del agente es que **se actualiza automáticamente** después de implementar cambios importantes.

### Cómo Funciona

Cuando el agente crea algo significativo:

```
Tú: "Crear dashboard con lista de grupos"

Agente:
├─ 1. Implementa la funcionalidad
│   ├─ Crea /app/dashboard/page.tsx
│   ├─ Crea /app/dashboard/layout.tsx
│   └─ Crea componentes necesarios
│
├─ 2. Actualiza su base de conocimientos
│   ├─ Marca en claude.md: dashboard/ # ✅ IMPLEMENTED
│   ├─ Mueve feature de "TO BE" a "COMPLETED"
│   ├─ Añade nuevos patterns a snippets.md
│   └─ Actualiza ROADMAP.md
│
└─ 3. Te confirma: "✅ Dashboard implementado y conocimiento actualizado"
```

### Archivos que Actualiza

El agente actualiza automáticamente:

1. **`.claude/claude.md`**
   - Project Structure (TO BE → ✅ IMPLEMENTED)
   - Implementation Status (pending → completed)
   - Database Schema (si hay cambios)
   - Common Patterns (nuevos patterns)

2. **`.claude/snippets.md`**
   - Code snippets reutilizables que crea
   - Patterns frecuentes

3. **`ROADMAP.md`**
   - Marca features como completadas
   - Actualiza estado de fases

4. **`RESUMEN.md`**
   - Estado actualizado del proyecto
   - Features implementadas

### Qué Actualiza Automáticamente

**ALTA PRIORIDAD** (siempre):
- ✅ Nuevas tablas o cambios de schema
- ✅ Features mayores (dashboard, expenses, admin)
- ✅ Nuevas RLS policies
- ✅ Cambios en estructura del proyecto

**MEDIA PRIORIDAD** (si es significativo):
- ✅ Componentes reutilizables importantes
- ✅ Utilities que se usarán frecuentemente
- ✅ Server Actions comunes
- ✅ Nuevos patterns establecidos

### Ventajas

✅ **Continuidad Total**
- El agente evoluciona con tu proyecto
- Próxima sesión ya conoce todo lo nuevo
- No pierde contexto entre días

✅ **Conocimiento Actualizado**
- Sabe exactamente qué está implementado
- No sugiere código ya existente
- Referencias siempre correctas

✅ **Cero Trabajo Manual**
- No actualizas documentación manualmente
- El agente lo hace por ti
- Siempre sincronizado

### Verificar Actualizaciones

```bash
# Ver qué ha actualizado el agente
git log -p .claude/claude.md

# Ver features implementadas
cat .claude/claude.md | grep "✅ IMPLEMENTED"

# Ver estado actual en RESUMEN
cat RESUMEN.md
```

### Actualización Manual (Opcional)

Si prefieres actualizar manualmente algo:

1. **`.claude/claude.md`** - Conocimiento principal
2. **`.claude/snippets.md`** - Code snippets
3. **Comandos nuevos** - Workflows específicos

Pero el agente debería manejar casi todo automáticamente.

## ❓ Preguntas Frecuentes

### P: ¿El agente puede modificar archivos directamente?
R: Sí, el agente puede crear, leer y modificar archivos del proyecto.

### P: ¿Necesito explicar el proyecto cada vez?
R: No, el agente ya conoce todo tu proyecto completo.

### P: ¿Funciona con cualquier archivo del proyecto?
R: Sí, el agente tiene acceso a todos los archivos.

### P: ¿Puedo usar el agente para debug?
R: Sí, el agente conoce tu schema y RLS policies para debugging.

### P: ¿El agente sabe qué falta implementar?
R: Sí, conoce el ROADMAP y el estado actual del proyecto.

### P: ¿Puedo pedirle que siga patterns específicos?
R: Sí, ya sigue los patterns de tu proyecto automáticamente.

## 🎉 ¡Empieza a Usar el Agente!

El agente está **100% configurado y listo**.

Solo tienes que:
1. Abrir Claude Code en este proyecto
2. Empezar a pedirle lo que necesites
3. ¡Disfrutar del desarrollo más rápido!

**No necesitas configurar nada más.** El agente se carga automáticamente con todo el conocimiento del proyecto.

---

💡 **Recuerda**: Mientras más específico seas en tus pedidos, mejores resultados obtendrás del agente.
