# 🎨 TravelHub Brand Colors - Guía de Uso

Esta guía documenta la paleta de colores oficial de TravelHub y cómo usarla en todo el proyecto.

---

## 📋 Paleta de Colores

### Colores Primarios (Identidad de Marca)

| Color | Nombre | Código | Variable CSS | Clase Tailwind | Uso |
|-------|--------|--------|--------------|----------------|-----|
| 🔵 | **Ocean Blue** | `#0EA5E9` | `--color-brand-ocean` | `bg-[var(--color-brand-ocean)]` | Color principal, botones primarios, enlaces |
| 🟣 | **Royal Purple** | `#8B5CF6` | `--color-brand-purple` | `bg-[var(--color-brand-purple)]` | Acentos, highlights, badges especiales |
| 🌸 | **Sunset Pink** | `#EC4899` | `--color-brand-pink` | `bg-[var(--color-brand-pink)]` | Llamados a la acción secundarios, favoritos |

### Colores Secundarios (Funcionales)

| Color | Nombre | Código | Variable CSS | Clase Tailwind | Uso |
|-------|--------|--------|--------------|----------------|-----|
| 🟢 | **Success Green** | `#10B981` | `--color-brand-success` | `bg-[var(--color-brand-success)]` | Confirmaciones, éxito, completado |
| 🟠 | **Energy Orange** | `#F97316` | `--color-brand-energy` | `bg-[var(--color-brand-energy)]` | Alertas importantes, ofertas especiales |
| 🔴 | **Alert Red** | `#EF4444` | `--color-brand-alert` | `bg-[var(--color-brand-alert)]` | Errores, alertas, acciones destructivas |

### Colores Neutros (Texto y Fondos)

| Color | Nombre | Código | Variable CSS | Clase Tailwind | Uso |
|-------|--------|--------|--------------|----------------|-----|
| ⚫ | **Deep Navy** | `#0F172A` | `--color-brand-navy` | `bg-[var(--color-brand-navy)]` | Texto principal, títulos |
| 🌑 | **Charcoal** | `#334155` | `--color-brand-charcoal` | `bg-[var(--color-brand-charcoal)]` | Texto secundario, subtítulos |
| 🌫️ | **Soft Gray** | `#64748B` | `--color-brand-gray` | `bg-[var(--color-brand-gray)]` | Texto terciario, placeholders |
| ☁️ | **Light Gray** | `#F1F5F9` | `--color-brand-light` | `bg-[var(--color-brand-light)]` | Fondos secundarios, bordes |
| ⚪ | **Pure White** | `#FFFFFF` | `--color-brand-white` | `bg-[var(--color-brand-white)]` | Fondos principales, textos sobre oscuro |

---

## 🎨 Shadcn/ui Theme Colors (Componentes)

Estos colores se usan automáticamente en todos los componentes de Shadcn/ui:

| Variable | Mapeo | Uso en Componentes |
|----------|-------|-------------------|
| `--color-primary` | Ocean Blue | Botones primarios, enlaces, focus states |
| `--color-accent` | Royal Purple | Badges, highlights, estados hover |
| `--color-destructive` | Alert Red | Botones de eliminar, alertas de error |
| `--color-muted` | Light Gray | Fondos secundarios, disabled states |
| `--color-border` | Slate 200 | Bordes de inputs, cards, separadores |

---

## 📝 Ejemplos de Uso

### 1. Botones Primarios

```tsx
// Usando clases de Shadcn/ui (recomendado)
<Button>Comenzar mi Viaje</Button>

// O con colores custom
<Button className="bg-[var(--color-brand-ocean)] hover:bg-[var(--color-brand-ocean)]/90">
  Reservar Ahora
</Button>
```

### 2. Gradientes de Marca (Landing Page)

```tsx
// Gradiente Ocean → Purple
<div className="bg-gradient-to-r from-[var(--color-brand-ocean)] via-[var(--color-brand-purple)] to-[var(--color-brand-pink)]">
  TravelHub
</div>

// Texto con gradiente
<h1 className="bg-gradient-to-r from-[var(--color-brand-ocean)] to-[var(--color-brand-purple)] bg-clip-text text-transparent">
  Viaja sin límites
</h1>
```

### 3. Badges de Estado

```tsx
// Éxito - Viaje confirmado
<Badge className="bg-[var(--color-brand-success)]">Confirmado</Badge>

// Alerta - Pago pendiente
<Badge className="bg-[var(--color-brand-energy)]">Pendiente</Badge>

// Error - Cancelado
<Badge className="bg-[var(--color-brand-alert)]">Cancelado</Badge>

// Purple - Premium/Featured
<Badge className="bg-[var(--color-brand-purple)]">Premium</Badge>
```

### 4. Tarjetas con Hover

```tsx
<Card className="hover:border-[var(--color-brand-ocean)] hover:shadow-[var(--color-brand-ocean)]/20 transition-all">
  {/* Contenido */}
</Card>
```

### 5. Textos

```tsx
// Título principal
<h1 className="text-[var(--color-brand-navy)]">Título Principal</h1>

// Subtítulo
<h2 className="text-[var(--color-brand-charcoal)]">Subtítulo</h2>

// Texto secundario
<p className="text-[var(--color-brand-gray)]">Descripción o texto secundario</p>

// Enlace
<a className="text-[var(--color-brand-ocean)] hover:underline">Ver más</a>
```

### 6. Fondos

```tsx
// Fondo principal
<div className="bg-[var(--color-brand-white)]">Contenido</div>

// Fondo secundario/alternativo
<div className="bg-[var(--color-brand-light)]">Sección alternativa</div>

// Fondo oscuro con texto claro
<div className="bg-[var(--color-brand-navy)] text-[var(--color-brand-white)]">
  Hero section
</div>
```

---

## 🎯 Guías de Uso por Contexto

### Landing Page
- **Hero**: Gradiente Ocean → Purple → Pink
- **CTA Principal**: Ocean Blue (button primary)
- **CTA Secundario**: Purple (button outline)
- **Badges**: Purple para "Featured", Orange para "Ofertas"

### Dashboard
- **Navbar**: Gradiente Ocean → Purple con glassmorphism
- **Sidebar activo**: Ocean Blue
- **Cards**: White con hover border Ocean
- **Stats**: Success Green (positivo), Alert Red (negativo)

### Admin Panel
- **Badge Admin**: Purple con gradiente
- **Acciones**: Ocean Blue (editar), Alert Red (eliminar)
- **Stats**: Success Green (activos), Gray (totales)

### Expense System
- **Pagado**: Success Green
- **Pendiente**: Energy Orange
- **Debe**: Alert Red
- **Balance positivo**: Success Green
- **Balance negativo**: Alert Red

### Status Badges
- **Upcoming** (Próximo): Ocean Blue
- **Active** (Activo): Success Green
- **Past** (Pasado): Soft Gray
- **Cancelled** (Cancelado): Alert Red

---

## 🔧 Dónde Modificar los Colores

### Archivo Principal
**`app/globals.css`** - Todas las variables de color están aquí en la sección `@theme`

### Para cambiar un color:
1. Busca la variable en `app/globals.css` (ejemplo: `--color-brand-ocean`)
2. Cambia el valor hexadecimal
3. El cambio se aplicará automáticamente en toda la app

### Ejemplo:
```css
/* Antes */
--color-brand-ocean: #0EA5E9;

/* Después (azul más oscuro) */
--color-brand-ocean: #0284C7;
```

---

## 🎨 Border Radius (Redondeado)

También definimos radios consistentes:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--radius-sm` | 6px | Badges pequeños |
| `--radius-md` | 8px | Botones, inputs |
| `--radius-lg` | 12px | Cards, dialogs |
| `--radius-xl` | 16px | Hero sections |
| `--radius-2xl` | 24px | Cards especiales |

---

## 📚 Referencias

- **Tailwind CSS v4**: Usamos el nuevo sistema `@theme`
- **Shadcn/ui**: Componentes usan las variables automáticamente
- **Accesibilidad**: Contraste WCAG AA cumplido
- **Responsive**: Colores consistentes en todos los breakpoints

---

## 💡 Tips

1. **Usa las variables CSS en lugar de colores hardcoded**: Facilita cambios globales
2. **Prefiere los componentes de Shadcn/ui**: Ya usan los colores de la marca
3. **Mantén consistencia**: Usa Ocean Blue para acciones primarias siempre
4. **Contraste**: Asegúrate de que el texto sea legible sobre fondos de color
5. **Modo oscuro**: Preparado para agregar variables dark mode en el futuro

---

**Última actualización**: 2025-11-16
**Mantenido por**: Equipo TravelHub
