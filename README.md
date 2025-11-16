# TravelHub - Plataforma de Gestión de Viajes Grupales

Una aplicación web completa para organizar y gestionar viajes grupales con amigos, familia o desconocidos. Incluye gestión de itinerarios, división de gastos, documentos compartidos, galería de fotos y más.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

## 🚀 Características Principales

### Gestión de Grupos
- ✅ Creación y administración de grupos de viaje
- ✅ Sistema de roles: Admin, Líder, Miembro
- ✅ Invitación de miembros por email
- ✅ Dashboard personalizado por usuario

### Itinerarios
- ✅ Planificación día a día con múltiples actividades
- ✅ Categorías: transporte, alojamiento, actividades, comidas
- ✅ Imágenes para cada actividad
- ✅ Mapa interactivo con ruta completa (Leaflet + OpenStreetMap)
- ✅ Ubicaciones con geocoding automático

### Paquetes de Viaje (Landing Page)
- ✅ Paquetes predefinidos por administradores
- ✅ Página pública con todos los paquetes disponibles
- ✅ Items incluidos/excluidos 100% personalizables
- ✅ Imágenes, descripción, precio estimado
- ✅ Asignación de paquetes a grupos

### Gestión de Gastos
- ✅ Registro de gastos compartidos
- ✅ Tres tipos de división: igual, porcentaje, personalizado
- ✅ Registro de pagos entre miembros
- ✅ Dashboard de balances y liquidaciones
- ✅ Historial completo de transacciones
- ✅ Múltiples monedas soportadas

### Documentos
- ✅ Almacenamiento de documentos de viaje
- ✅ Categorías: vuelos, buses, trenes, hoteles, actividades
- ✅ Upload seguro con validación de tipo y tamaño
- ✅ Descarga de documentos

### Galería de Fotos
- ✅ Upload múltiple de fotos
- ✅ Vista de galería con lightbox
- ✅ Comentarios en fotos
- ✅ Navegación con teclado

### Notas Colaborativas
- ✅ Editor de notas compartidas
- ✅ Tracking de última edición
- ✅ Contador de palabras y caracteres

### Panel de Administración
- ✅ Gestión de usuarios y roles
- ✅ Vista de todos los grupos
- ✅ Estadísticas globales de la plataforma
- ✅ Gestión completa de paquetes de viaje

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16 (App Router) con React 19
- **Lenguaje**: TypeScript 5.0
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Mapas**: Leaflet + React-Leaflet
- **Iconos**: Lucide React
- **Notificaciones**: Sonner (toasts)

### Backend
- **BaaS**: Supabase
  - PostgreSQL (base de datos)
  - Auth (autenticación)
  - Storage (archivos)
  - Row Level Security (seguridad)
- **Data Fetching**: TanStack Query (React Query)
- **Server Actions**: Next.js 15+ server actions

### Testing
- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Playwright

## 📦 Instalación

### Prerequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (gratis)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd travel-agency
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Configurar Supabase

**¡Solo 2 archivos SQL!** 🚀

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en SQL Editor (crea TODO: 15 tablas, índices, RLS)
3. Ejecuta `supabase/storage-buckets.sql` en SQL Editor (crea 7 buckets con permisos)

**Guías detalladas:**
- [Quick Start](docs/QUICK_START.md) - Setup en 5 minutos
- [Database Setup](docs/DATABASE_SETUP.md) - Guía completa de base de datos

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
travel-agency/
├── app/                           # Next.js App Router
│   ├── auth/                      # Login, registro
│   ├── dashboard/                 # Dashboard del usuario
│   ├── groups/[id]/               # Páginas de grupo
│   │   ├── page.tsx               # Overview
│   │   ├── members/               # Gestión de miembros
│   │   ├── itinerary/             # Itinerario
│   │   ├── expenses/              # Gastos y balances
│   │   ├── documents/             # Documentos
│   │   ├── photos/                # Galería de fotos
│   │   └── notes/                 # Notas
│   ├── admin/                     # Panel de administración
│   │   ├── users/                 # Gestión de usuarios
│   │   ├── groups/                # Vista de todos los grupos
│   │   └── packages/              # Gestión de paquetes
│   ├── paquetes/[id]/             # Página pública de paquete
│   ├── page.tsx                   # Landing page
│   └── layout.tsx
├── components/
│   ├── ui/                        # Componentes de Shadcn/ui
│   ├── layout/                    # Navbar, sidebar
│   ├── groups/                    # Componentes de grupos
│   ├── itinerary/                 # Componentes de itinerario
│   ├── expenses/                  # Componentes de gastos
│   ├── documents/                 # Componentes de documentos
│   ├── photos/                    # Componentes de fotos
│   ├── notes/                     # Componentes de notas
│   ├── packages/                  # Componentes de paquetes
│   └── admin/                     # Componentes de admin
├── lib/
│   ├── supabase/                  # Clientes de Supabase
│   │   ├── client.ts              # Cliente del navegador
│   │   ├── server.ts              # Cliente del servidor
│   │   └── middleware.ts          # Middleware
│   ├── actions/                   # Server actions
│   │   ├── group-actions.ts
│   │   ├── itinerary-actions.ts
│   │   ├── expense-actions.ts
│   │   ├── payment-actions.ts
│   │   ├── package-actions.ts
│   │   └── ...
│   ├── validations/               # Zod schemas
│   │   ├── group.ts
│   │   ├── itinerary.ts
│   │   ├── expense.ts
│   │   ├── package.ts
│   │   └── ...
│   ├── types/
│   │   └── database.types.ts      # Tipos generados de Supabase
│   └── utils/
│       └── expense-calculator.ts   # Cálculo de balances
├── supabase/
│   ├── schema.sql                 # 🎯 Schema completo (TODO en 1 archivo)
│   ├── storage-buckets.sql        # 🎯 Storage completo (7 buckets + RLS)
│   └── migrations-backup/         # Migraciones históricas (solo referencia)
├── docs/                          # Documentación
│   ├── QUICK_START.md             # Guía de inicio rápido
│   ├── SETUP_SUPABASE.md          # Setup detallado de Supabase
│   ├── ROADMAP.md                 # Roadmap del proyecto
│   ├── PROJECT_STATUS.md          # Estado actual del proyecto
│   ├── TESTING.md                 # Guía de testing
│   └── COMO_USAR_AGENTE.md        # Guía para Claude Code Agent
├── __tests__/                     # Tests
│   ├── unit/                      # Tests unitarios (Vitest)
│   └── e2e/                       # Tests E2E (Playwright)
└── .claude/                       # Configuración del agente
    └── claude.md                  # Knowledge base del agente
```

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Perfiles de usuarios (extiende auth.users) |
| `travel_groups` | Grupos de viaje |
| `group_members` | Relación usuarios-grupos con roles |
| `itinerary_items` | Actividades del cronograma (grupos) |
| `travel_packages` | Paquetes predefinidos (landing page) |
| `package_itinerary_items` | Itinerario de paquetes |
| `package_included_items` | Items incluidos en paquetes |
| `package_excluded_items` | Items NO incluidos en paquetes |
| `expenses` | Gastos del grupo |
| `expense_splits` | División de gastos |
| `expense_payments` | Pagos entre miembros |
| `travel_documents` | Documentos del viaje |
| `photos` | Fotos del viaje |
| `photo_comments` | Comentarios en fotos |
| `group_notes` | Notas colaborativas |

Ver el schema completo en [supabase/schema.sql](supabase/schema.sql)

## 🔐 Sistema de Seguridad

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS configuradas:
- Los usuarios solo pueden ver grupos de los que son miembros
- Solo líderes y admins pueden modificar grupos
- Los usuarios pueden eliminar su propio contenido
- Los admins tienen acceso completo

### Roles de Usuario

**Roles globales:**
- `admin` - Acceso total a la plataforma
- `user` - Usuario regular

**Roles dentro de grupos:**
- `leader` - Puede gestionar el grupo y miembros
- `member` - Puede participar y ver contenido

## 🧪 Testing

```bash
# Tests unitarios e integración (Vitest)
npm run test

# Tests E2E (Playwright)
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui
```

Ver guía completa en [docs/TESTING.md](docs/TESTING.md)

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Tests
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:e2e:ui       # E2E con interfaz
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Haz push del código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático en cada push

### Otras Plataformas

Compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

Ver [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying)

## 📚 Documentación

- **[Quick Start](docs/QUICK_START.md)** - Configuración en 5 minutos
- **[Setup Supabase](docs/SETUP_SUPABASE.md)** - Guía detallada de configuración
- **[Roadmap](docs/ROADMAP.md)** - Plan de desarrollo
- **[Project Status](docs/PROJECT_STATUS.md)** - Estado actual del proyecto
- **[Testing](docs/TESTING.md)** - Guía de testing
- **[Como Usar Agente](docs/COMO_USAR_AGENTE.md)** - Para desarrollo con Claude Code

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y no tiene licencia pública por ahora.

## 🙏 Créditos

### Tecnologías
- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Leaflet](https://leafletjs.com/) - Mapas interactivos
- [OpenStreetMap](https://www.openstreetmap.org/) - Datos de mapas

### APIs
- [Nominatim](https://nominatim.org/) - Geocoding gratuito

---

**Desarrollado con ❤️ usando Next.js 16, TypeScript y Supabase**
# Force redeploy with environment variables
