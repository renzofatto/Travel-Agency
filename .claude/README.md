# TravelHub Claude Agent

Este directorio contiene la configuración del agente especializado para el proyecto TravelHub.

## ¿Qué es esto?

El agente de Claude ha sido configurado con conocimiento profundo del proyecto TravelHub para que puedas desarrollar más rápido sin tener que explicar el contexto cada vez.

## Archivos del Agente

### `claude.md`
**Archivo principal del agente** - Contiene toda la información del proyecto:
- Descripción general
- Stack tecnológico completo
- Estructura del proyecto
- Esquema de base de datos (10 tablas)
- Modelo de seguridad (RLS policies)
- Estado de implementación
- Guidelines de desarrollo
- Patterns y best practices

### `snippets.md`
**Snippets de código reutilizables**:
- Queries de Supabase comunes
- Server Actions con tipos
- React Hook Form + Zod patterns
- TanStack Query hooks
- Upload de archivos
- Checks de permisos
- Loading states
- Error handling
- Utilities comunes

### `commands/`
**Comandos especializados** que puedes usar:

1. **`new-feature.md`** - Crear nueva funcionalidad
   - Guía paso a paso
   - Considera DB, seguridad, UI
   - Testing checklist

2. **`review-code.md`** - Review de código
   - Security checklist
   - TypeScript best practices
   - Next.js patterns
   - Performance checks

3. **`debug-issue.md`** - Debug de problemas
   - Proceso de debugging
   - Issues comunes por categoría
   - Soluciones específicas

4. **`add-component.md`** - Agregar componentes
   - Templates para Server/Client components
   - Form components
   - Best practices

5. **`update-database.md`** - Modificar DB
   - Migration templates
   - Update TypeScript types
   - RLS policies
   - Safety checklist

## Cómo Usar el Agente

### En Claude Code (CLI)

El agente se carga automáticamente cuando trabajas en este proyecto. Claude tiene acceso a:
- Todo el conocimiento en `claude.md`
- Los snippets de código
- Los comandos especializados

### Comandos Slash Personalizados (Opcional)

Puedes crear comandos personalizados en `.claude/commands/` para workflows específicos.

Ejemplo de uso:
```bash
/new-feature   # Para crear una nueva funcionalidad
/review-code   # Para review de código
/debug-issue   # Para ayuda con debugging
/add-component # Para crear componentes
/update-database # Para modificar schema
```

## Ventajas de Usar el Agente

### ✅ Sin Repetir Contexto
No necesitas explicar cada vez:
- La estructura del proyecto
- El esquema de base de datos
- Las políticas de seguridad
- El stack tecnológico
- Los patterns establecidos

### ✅ Respuestas Consistentes
El agente conoce:
- Todos los tipos TypeScript del proyecto
- Las convenciones de código
- La estructura de carpetas
- Los componentes existentes

### ✅ Mejores Sugerencias
El agente puede:
- Sugerir soluciones basadas en código existente
- Identificar problemas de seguridad (RLS)
- Recomendar best practices del proyecto
- Proveer snippets específicos

### ✅ Ahorro de Tokens
- Menos contexto en cada mensaje
- Respuestas más directas
- Código más relevante

## Ejemplos de Uso

### Crear Nueva Funcionalidad
```
Tú: "Necesito crear el dashboard con lista de grupos"

Agent: "Voy a crear el dashboard. Según el proyecto, necesitamos:
- /app/dashboard/page.tsx (Server Component)
- /app/dashboard/layout.tsx con sidebar
- Query a travel_groups filtrando por group_members
- Las políticas RLS ya permiten esto
- Usar los componentes de Shadcn/ui instalados

[Crea los archivos siguiendo los patterns del proyecto]"
```

### Debug de Problema
```
Tú: "Error: Row Level Security policy violation al ver un grupo"

Agent: "Este error indica que el usuario no tiene permisos. Verifico:
1. ¿El usuario es miembro del grupo? (group_members)
2. ¿La política 'Users can view their groups' está activa?
3. ¿Estás usando el cliente correcto? (server vs browser)

Según el schema, la policy debería permitir si:
- El usuario es admin O
- El usuario está en group_members

[Provee solución específica basada en tu código]"
```

### Agregar Componente
```
Tú: "Necesito un componente para mostrar la card de un grupo"

Agent: "Voy a crear GroupCard en components/groups/:
- Server Component (no necesita interactividad)
- Props: TravelGroup type de database.types.ts
- Usa Card de Shadcn/ui
- Responsive grid layout
- Shows: cover_image, name, destination, dates

[Crea componente siguiendo patterns existentes]"
```

## 🔄 Actualización Automática del Agente

### ¡El Agente se Actualiza Solo! 🎉

El agente tiene instrucciones para **actualizar su propia base de conocimientos** después de implementar cambios significativos.

### Cómo Funciona

Cuando el agente implementa algo importante:

1. **Implementa la funcionalidad** que pediste
2. **Actualiza automáticamente** `.claude/claude.md`
3. **Te confirma**: "✅ Feature implementada y conocimiento actualizado"

### Ejemplo de Flujo

```
Tú: "Crear dashboard con lista de grupos"

Agente:
1. Crea /app/dashboard/page.tsx
2. Crea /app/dashboard/layout.tsx
3. Crea componentes necesarios
4. ACTUALIZA .claude/claude.md:
   - Marca dashboard como ✅ IMPLEMENTED
   - Añade nuevos patterns creados
   - Actualiza estructura del proyecto
5. Te confirma: "Dashboard implementado. Base de conocimientos actualizada."
```

### Qué se Actualiza Automáticamente

**HIGH PRIORITY** (siempre):
- ✅ Nuevas tablas o cambios de schema
- ✅ Features importantes (dashboard, expenses, etc.)
- ✅ Nuevas RLS policies
- ✅ Cambios de estructura

**MEDIUM PRIORITY** (si es significativo):
- ✅ Nuevos patterns reutilizables
- ✅ Utilidades importantes
- ✅ Server Actions comunes
- ✅ Cambios de configuración

### Archivos que el Agente Actualiza

1. **`.claude/claude.md`** - Base de conocimientos principal
   - Project Structure (TO BE → ✅ IMPLEMENTED)
   - Implementation Status
   - Database Schema (si hay cambios)
   - Common Patterns (nuevos patterns)

2. **`.claude/snippets.md`** - Code snippets
   - Patterns frecuentes que crea
   - Utilities reutilizables

3. **`ROADMAP.md`** - Estado del proyecto
   - Marca features completadas

4. **`RESUMEN.md`** - Resumen actual
   - Estado actualizado del proyecto

### Ventajas de la Auto-Actualización

✅ **Conocimiento Siempre Actualizado**
- El agente sabe exactamente qué está implementado
- No sugiere features ya existentes
- Referencias correctas a código actual

✅ **Continuidad Entre Sesiones**
- Próxima vez que uses el agente, ya conoce lo nuevo
- No pierde contexto entre días
- Evoluciona con tu proyecto

✅ **Sin Trabajo Manual**
- No tienes que actualizar docs manualmente
- El agente lo hace automáticamente
- Siempre está sincronizado

### Verificar Actualizaciones

Para ver qué ha actualizado el agente:

```bash
# Ver historial de cambios en claude.md
git log -p .claude/claude.md

# Ver estado actual
cat .claude/claude.md | grep "✅ IMPLEMENTED"
```

### Actualización Manual (Opcional)

Si prefieres actualizar manualmente:

1. **Actualiza `claude.md`** cuando:
   - Agregues nuevas tablas importantes
   - Cambies la estructura del proyecto
   - Implementes nuevos patterns principales

2. **Agrega a `snippets.md`** cuando:
   - Crees patterns reutilizables
   - Tengas código que usas frecuentemente

3. **Crea comandos nuevos** cuando:
   - Tengas workflows repetitivos
   - Necesites guías específicas

## Estado Actual del Proyecto

**Fase 1**: ✅ Completada
- Infraestructura
- Base de datos
- Autenticación
- Landing page

**Fase 2**: 🚧 Siguiente
- Dashboard
- Gestión de grupos
- Ver ROADMAP.md

## Tips para Mejores Resultados

1. **Sé específico** en tus pedidos
   - Malo: "Crear grupos"
   - Bueno: "Crear página para listar grupos del usuario con filtros"

2. **Menciona restricciones**
   - "Solo para líderes de grupo"
   - "Con validación de fechas"
   - "Responsive para mobile"

3. **Referencias existentes**
   - "Siguiendo el pattern de login"
   - "Similar a la landing page"
   - "Usando los mismos estilos"

4. **Contexto de usuario**
   - "Para usuarios admin"
   - "Visible solo para miembros"
   - "Público en landing"

## Soporte

Si el agente no responde como esperabas:
1. Verifica que estés en el proyecto correcto
2. Sé más específico en tu request
3. Menciona el archivo `claude.md` si necesitas algo del contexto
4. Usa los comandos especializados cuando corresponda

---

**¡El agente está listo para ayudarte a desarrollar TravelHub de forma más eficiente!** 🚀
