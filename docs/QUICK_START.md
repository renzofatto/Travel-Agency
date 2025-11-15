# 🚀 Quick Start - TravelHub

## Inicio Rápido en 5 Minutos

### 1. Crear Proyecto en Supabase (2 minutos)

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Click en "New Project"
3. Completa:
   - **Name**: TravelHub
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Selecciona la más cercana
4. Click "Create new project" (tarda ~1 minuto)

### 2. Obtener Credenciales (30 segundos)

1. En Supabase, ve a **Settings** (⚙️) > **API**
2. Copia:
   - **Project URL**
   - **anon public key**

### 3. Configurar Variables de Entorno (30 segundos)

Edita el archivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=pega-tu-project-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=pega-tu-anon-key-aqui
\`\`\`

### 4. Crear Base de Datos (1 minuto)

1. En Supabase, ve a **SQL Editor**
2. Click "New query"
3. Abre el archivo \`supabase/schema.sql\` de este proyecto
4. Copia TODO el contenido y pégalo en el editor
5. Click "Run" (▶️)
6. Haz lo mismo con \`supabase/rls-policies.sql\`

### 5. Ejecutar la Aplicación (30 segundos)

\`\`\`bash
npm install  # Solo la primera vez
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

### 6. Crear tu Cuenta (30 segundos)

1. Click en "Comenzar Gratis" o "Registrarse"
2. Completa el formulario
3. ¡Listo! Ya tienes acceso

---

## Convertirte en Administrador

Para tener acceso completo:

1. Registra tu cuenta primero
2. Ve a Supabase **Authentication** > **Users**
3. Copia tu UUID (el ID de tu usuario)
4. Ve al **SQL Editor** y ejecuta:

\`\`\`sql
UPDATE public.users
SET role = 'admin'
WHERE id = 'TU-UUID-AQUI';
\`\`\`

5. Recarga la página y ya eres admin

---

## Siguiente Paso: Crear Storage Buckets (Opcional)

Solo necesario cuando vayas a subir imágenes o documentos.

1. Ve a **Storage** en Supabase
2. Crea estos buckets:

| Bucket | Público | Descripción |
|--------|---------|-------------|
| avatars | ✅ | Fotos de perfil |
| group-covers | ✅ | Portadas de grupos |
| photos | ✅ | Fotos del viaje |
| travel-documents | ❌ | Documentos privados |
| receipts | ❌ | Recibos de gastos |

---

## Troubleshooting Rápido

### Error: "Cannot connect to Supabase"
- ✅ Verifica que las credenciales en `.env.local` sean correctas
- ✅ Reinicia el servidor de desarrollo (Ctrl+C y `npm run dev`)

### Error: "Row Level Security policy violation"
- ✅ Asegúrate de haber ejecutado `rls-policies.sql`
- ✅ Verifica que estés autenticado

### No puedo registrarme
- ✅ Verifica que el schema.sql se haya ejecutado correctamente
- ✅ Revisa la consola del navegador (F12) para ver errores

---

## Documentación Completa

- 📖 **README.md** - Documentación principal del proyecto
- 🔧 **SETUP_SUPABASE.md** - Guía detallada de configuración
- 🗺️ **ROADMAP.md** - Plan de desarrollo y próximas features
- 📝 **RESUMEN.md** - Estado actual y resumen técnico

---

## Comandos Útiles

\`\`\`bash
# Desarrollo
npm run dev

# Build
npm run build

# Ver errores
npm run lint

# Agregar componentes UI
npx shadcn@latest add button
\`\`\`

---

## ¿Listo para Desarrollar?

El proyecto incluye:
- ✅ Autenticación funcional
- ✅ Landing page
- ✅ Base de datos completa
- ✅ Seguridad configurada
- ✅ UI components instalados

**Próximo paso**: Implementar el Dashboard (ver ROADMAP.md Fase 2)

¡Feliz coding! 🎉
