# Índice de Documentación - TravelHub

Bienvenido a la documentación de TravelHub. Aquí encontrarás toda la información necesaria para configurar, desarrollar y mantener el proyecto.

## 📚 Guías de Configuración

### [Quick Start](QUICK_START.md) ⚡
**Tiempo estimado: 5 minutos**

Guía rápida para poner el proyecto en marcha. Ideal para:
- Primera vez configurando el proyecto
- Desarrollo local
- Demo rápido

### [Setup Supabase](SETUP_SUPABASE.md) 🗄️
**Tiempo estimado: 15-20 minutos**

Guía detallada para configurar Supabase desde cero:
- Creación de proyecto
- Configuración de base de datos
- Storage buckets
- RLS policies
- Migraciones

### [Migration Checklist](MIGRATION_CHECKLIST.md) ✔️
**Lista de verificación de migraciones**

Checklist paso a paso para ejecutar todas las migraciones:
- Orden correcto de ejecución
- Verificaciones después de cada paso
- Troubleshooting común
- Scripts SQL de verificación

## 📋 Estado del Proyecto

### [Project Status](PROJECT_STATUS.md) ✅
Estado actual de implementación:
- Features completadas
- Features en progreso
- Próximos pasos
- Changelog

### [Roadmap](ROADMAP.md) 🗺️
Plan de desarrollo del proyecto:
- Fases de desarrollo
- Features planeadas
- Prioridades
- Timeline estimado

## 🧪 Testing

### [Testing Guide](TESTING.md) 🧪
Guía completa de testing:
- Configuración de tests
- Tests unitarios con Vitest
- Tests E2E con Playwright
- Buenas prácticas
- Coverage

## 🤖 Desarrollo con IA

### [Como Usar Agente](COMO_USAR_AGENTE.md) 🤖
Guía para trabajar con Claude Code Agent:
- Comandos disponibles
- Patrones de desarrollo
- Knowledge base
- Tips y trucos

## 📖 Referencia Técnica

### Arquitectura del Proyecto

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.0
- Tailwind CSS
- Shadcn/ui

**Backend:**
- Supabase (PostgreSQL)
- Row Level Security
- Server Actions
- TanStack Query

**Testing:**
- Vitest (Unit/Integration)
- Playwright (E2E)

### Estructura de Carpetas

```
travel-agency/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Utilidades y lógica
│   ├── supabase/          # Clientes de Supabase
│   ├── actions/           # Server actions
│   ├── validations/       # Zod schemas
│   └── utils/             # Funciones helper
├── supabase/              # SQL y migraciones
├── docs/                  # Documentación
└── __tests__/             # Tests
```

## 🔗 Enlaces Rápidos

### Documentación Externa
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

### Herramientas
- [Leaflet Docs](https://leafletjs.com/reference.html) - Mapas
- [React Hook Form](https://react-hook-form.com/) - Formularios
- [Zod](https://zod.dev/) - Validación
- [Vitest](https://vitest.dev/) - Testing
- [Playwright](https://playwright.dev/) - E2E Testing

## 📝 Convenciones del Proyecto

### Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Branches
- `main` - Producción estable
- `develop` - Desarrollo activo
- `feature/*` - Nuevas features
- `fix/*` - Bug fixes
- `docs/*` - Documentación

### Pull Requests
1. Crear branch desde `develop`
2. Implementar cambios con tests
3. Abrir PR a `develop`
4. Review y merge
5. Deploy automático (Vercel)

## 🆘 Ayuda y Soporte

### Problemas Comunes

**Error: Cannot connect to Supabase**
- Verifica las variables de entorno en `.env.local`
- Asegúrate que el proyecto de Supabase esté activo
- Verifica las políticas RLS

**Error: Storage bucket not found**
- Ejecuta los scripts de storage en `supabase/storage/`
- Verifica que los buckets estén creados en Supabase

**Tests fallan**
- Verifica que las migraciones estén ejecutadas
- Asegúrate de tener datos de prueba
- Revisa los logs de Playwright/Vitest

### Contacto

Para preguntas o problemas:
1. Revisa la documentación
2. Busca en issues de GitHub
3. Abre un nuevo issue

---

**Última actualización**: 2025-11-15
