# TravelHub - Plataforma de Gestión de Viajes Grupales

Una aplicación web completa para organizar y gestionar viajes grupales con amigos, familia o desconocidos.

## Características Principales

- **Autenticación de usuarios** con Supabase Auth
- **Gestión de grupos de viaje** con sistema de roles (admin, líder, miembro)
- **Cronograma colaborativo** con actividades diarias y drag & drop
- **División de gastos** tipo Splitwise para compartir gastos entre miembros
- **Gestión de documentos** (pasajes, reservas, tickets)
- **Galería de fotos compartida** con comentarios
- **Notas colaborativas** para cada grupo
- **Panel de administrador** para gestión global

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Gestión de estado**: TanStack Query
- **Formularios**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Gráficos**: Recharts

## Instalación y Configuración

### 1. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Project Settings > API**
4. Copia la **Project URL** y la **anon/public key**

### 3. Configurar variables de entorno

Crea un archivo \`.env.local\` en la raíz del proyecto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
\`\`\`

### 4. Configurar la base de datos

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Ejecuta el script \`supabase/schema.sql\` para crear las tablas
3. Ejecuta el script \`supabase/rls-policies.sql\` para configurar las políticas de seguridad

### 5. Configurar Storage en Supabase

1. Ve a **Storage** en tu proyecto de Supabase
2. Crea los siguientes buckets:
   - \`group-covers\` (público)
   - \`travel-documents\` (privado)
   - \`photos\` (público)
   - \`receipts\` (privado)
   - \`avatars\` (público)

### 6. Ejecutar el proyecto

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

\`\`\`
travel-agency/
├── app/                        # App Router de Next.js
│   ├── auth/                   # Páginas de autenticación
│   ├── dashboard/              # Dashboard del usuario
│   ├── groups/[id]/            # Páginas de grupo individual
│   ├── admin/                  # Panel de administrador
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # Componentes React
│   ├── ui/                     # Componentes de Shadcn/ui
│   └── shared/                 # Componentes compartidos
├── lib/                        # Utilidades y configuración
│   ├── supabase/               # Clientes de Supabase
│   ├── types/                  # Tipos TypeScript
│   └── utils.ts
├── supabase/                   # Scripts SQL
│   ├── schema.sql
│   └── rls-policies.sql
└── public/                     # Archivos estáticos
\`\`\`

## Esquema de Base de Datos

### Tablas principales:

- **users**: Perfiles de usuarios (extiende auth.users)
- **travel_groups**: Grupos de viaje
- **group_members**: Relación usuarios-grupos con roles
- **itinerary_items**: Actividades del cronograma
- **travel_documents**: Documentos del viaje
- **photos**: Fotos del viaje
- **photo_comments**: Comentarios en fotos
- **expenses**: Gastos del grupo
- **expense_splits**: División de gastos entre miembros
- **group_notes**: Notas colaborativas del grupo

## Sistema de Roles

### Roles de usuario global:
- **admin**: Acceso completo a toda la plataforma
- **user**: Usuario regular

### Roles dentro de un grupo:
- **leader**: Puede gestionar el grupo, agregar/remover miembros, asignar líderes
- **member**: Puede ver y participar en actividades del grupo

## Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
\`\`\`

## Deploy en Vercel

La forma más fácil de deployar esta aplicación es usando [Vercel](https://vercel.com/new).

Consulta la [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

---

**Nota**: Asegúrate de configurar correctamente las políticas RLS (Row Level Security) en Supabase para mantener la seguridad de los datos.
