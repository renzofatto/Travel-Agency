# Roadmap de Desarrollo - TravelHub

## Fase 1: Fundamentos ✅ COMPLETADO

- [x] Setup del proyecto Next.js 14 con TypeScript
- [x] Configuración de Tailwind CSS y Shadcn/ui
- [x] Instalación de dependencias principales
- [x] Configuración de Supabase (cliente y servidor)
- [x] Creación de esquema de base de datos completo
- [x] Configuración de políticas RLS (Row Level Security)
- [x] Definición de tipos TypeScript para la base de datos
- [x] Sistema de autenticación (Login y Register)
- [x] Landing page con features principales
- [x] Documentación de configuración

## Fase 2: Dashboard y Gestión de Grupos (PRÓXIMO)

### Dashboard del Usuario
- [ ] Layout principal con navegación
- [ ] Página de dashboard
  - [ ] Lista de grupos del usuario
  - [ ] Resumen de próximos viajes
  - [ ] Estadísticas rápidas
  - [ ] Acciones rápidas (crear grupo, etc.)

### Gestión de Grupos
- [ ] Crear nuevo grupo de viaje
  - [ ] Formulario con validación (React Hook Form + Zod)
  - [ ] Subida de imagen de portada
  - [ ] Selección de fechas
  - [ ] El creador se vuelve líder automáticamente
- [ ] Vista de detalle de grupo
  - [ ] Tabs para diferentes secciones
  - [ ] Información general editable
- [ ] Editar grupo (solo líderes)
- [ ] Eliminar grupo (solo admin)
- [ ] Lista de miembros
  - [ ] Agregar miembros por email
  - [ ] Asignar/revocar rol de líder
  - [ ] Remover miembros
  - [ ] Avatar y nombre de cada miembro

### Componentes Reutilizables
- [ ] Navbar con menú de usuario
- [ ] Sidebar de navegación
- [ ] Cards de grupos
- [ ] Componente de avatar
- [ ] Breadcrumbs
- [ ] Loading states y skeletons

## Fase 3: Cronograma/Itinerario

- [ ] Vista de calendario del viaje
- [ ] Crear actividades del itinerario
  - [ ] Formulario con fecha, hora, ubicación
  - [ ] Categorías (transporte, alojamiento, actividad, comida)
  - [ ] Descripción y notas
- [ ] Editar actividades
- [ ] Eliminar actividades
- [ ] Vista de timeline/cronograma
- [ ] Drag & drop para reorganizar actividades (@dnd-kit)
- [ ] Filtros por categoría y fecha
- [ ] Vista de lista vs vista de calendario
- [ ] Exportar cronograma a PDF (opcional)

## Fase 4: Sistema de División de Gastos

### Registro de Gastos
- [ ] Formulario para agregar gastos
  - [ ] Monto y moneda
  - [ ] Descripción y categoría
  - [ ] Quién pagó (selector de miembros)
  - [ ] Tipo de división (equitativo, porcentajes, custom)
  - [ ] Subir foto del recibo
  - [ ] Fecha del gasto
- [ ] Lista de gastos del grupo
- [ ] Editar gastos
- [ ] Eliminar gastos

### División y Cálculos
- [ ] Calcular división automática
  - [ ] División equitativa
  - [ ] Por porcentajes
  - [ ] Montos personalizados
- [ ] Dashboard de gastos
  - [ ] Total gastado por persona
  - [ ] Resumen "quién debe a quién"
  - [ ] Gráficos de gastos por categoría (Recharts)
  - [ ] Gráficos de gastos por persona
- [ ] Marcar deudas como saldadas
- [ ] Historial de transacciones
- [ ] Exportar resumen de gastos (CSV/PDF)

## Fase 5: Documentos y Fotos

### Gestión de Documentos
- [ ] Subir documentos de viaje
  - [ ] Drag & drop para subir archivos
  - [ ] Categorización (pasaje, hotel, actividad, etc.)
  - [ ] Título y descripción
  - [ ] Preview de documentos
- [ ] Lista de documentos con filtros
- [ ] Descargar documentos
- [ ] Eliminar documentos (solo quien lo subió o admin)
- [ ] Búsqueda de documentos

### Galería de Fotos
- [ ] Subir fotos del viaje
  - [ ] Subida múltiple
  - [ ] Compresión automática
  - [ ] Caption/descripción
  - [ ] Fecha de la foto
- [ ] Galería con grid responsivo
- [ ] Lightbox para ver fotos en grande
- [ ] Comentarios en fotos
  - [ ] Agregar comentario
  - [ ] Lista de comentarios
  - [ ] Eliminar propio comentario
- [ ] Filtros por fecha
- [ ] Eliminar propias fotos

## Fase 6: Notas Colaborativas

- [ ] Editor de texto enriquecido (markdown)
  - [ ] Títulos, listas, negrita, cursiva
  - [ ] Links
  - [ ] Checklists
- [ ] Guardar cambios automáticamente
- [ ] Mostrar último editor y fecha
- [ ] Historial de cambios (opcional)
- [ ] Realtime editing con Supabase Realtime (opcional)

## Fase 7: Panel de Administrador

- [ ] Dashboard de administrador
  - [ ] Estadísticas globales
  - [ ] Grupos activos
  - [ ] Usuarios registrados
  - [ ] Actividad reciente
- [ ] Gestión de grupos
  - [ ] Ver todos los grupos
  - [ ] Crear grupos manualmente
  - [ ] Asignar líder inicial
  - [ ] Agregar miembros a grupos
  - [ ] Editar cualquier grupo
  - [ ] Eliminar grupos
- [ ] Gestión de usuarios
  - [ ] Lista de todos los usuarios
  - [ ] Cambiar roles (admin/user)
  - [ ] Ver grupos de un usuario
  - [ ] Desactivar usuarios (opcional)
- [ ] Búsqueda y filtros avanzados

## Fase 8: Mejoras y Optimizaciones

### Funcionalidades Adicionales
- [ ] Notificaciones
  - [ ] Cuando alguien te agrega a un grupo
  - [ ] Nuevos gastos agregados
  - [ ] Cambios en el itinerario
  - [ ] Nuevas fotos subidas
- [ ] Búsqueda global
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
  - [ ] Español
  - [ ] Inglés
- [ ] PWA (Progressive Web App)
  - [ ] Funcionar offline
  - [ ] Instalable en móvil

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Infinite scroll en listas largas
- [ ] Optimización de queries con TanStack Query
- [ ] Caching estratégico
- [ ] Compresión de imágenes en el cliente
- [ ] Optimización de bundle size

### Testing
- [ ] Tests unitarios (componentes clave)
- [ ] Tests de integración
- [ ] Tests E2E con Playwright (opcional)

### DevOps
- [ ] CI/CD con GitHub Actions
- [ ] Deploy automático a Vercel
- [ ] Monitoreo de errores (Sentry opcional)
- [ ] Analytics (opcional)

## Fase 9: Características Premium (Futuro)

- [ ] Integración con APIs de viajes
  - [ ] Vuelos (Skyscanner, Amadeus)
  - [ ] Hoteles (Booking, Airbnb)
  - [ ] Actividades (GetYourGuide)
- [ ] Recomendaciones de IA
  - [ ] Sugerencias de itinerario
  - [ ] Optimización de rutas
- [ ] Mapas interactivos
  - [ ] Google Maps / Mapbox
  - [ ] Marcar ubicaciones del itinerario
- [ ] Chat grupal integrado
- [ ] Encuestas para decisiones grupales
- [ ] Calendario compartido con sincronización

---

## Prioridad de Desarrollo

1. **Alta**: Fases 2-6 (Core features)
2. **Media**: Fase 7-8 (Admin y mejoras)
3. **Baja**: Fase 9 (Features premium)

## Estimación de Tiempo

- Fase 2: 2-3 días
- Fase 3: 2-3 días
- Fase 4: 3-4 días
- Fase 5: 2-3 días
- Fase 6: 1-2 días
- Fase 7: 2-3 días
- Fase 8: 3-5 días

**Total estimado**: 15-23 días de desarrollo

## Notas

- Cada fase debe incluir testing manual
- Documentar nuevas funcionalidades en README
- Mantener código limpio y componentes reutilizables
- Seguir las mejores prácticas de Next.js 14 y React
- Asegurar que todo funcione en mobile y desktop
