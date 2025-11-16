# Modern Navbar Design - TravelHub

## Overview

The TravelHub application features a futuristic, animated navbar with glassmorphism effects, floating particles, and a travel-themed design. The navbar has three implementations:

1. **Dashboard Navbar** (`components/layout/navbar.tsx`) - Authenticated users with conditional floating behavior
2. **Landing Page Navbar** (`components/layout/landing-navbar.tsx`) - Dynamic navbar that shows different UI based on authentication status:
   - **Not authenticated**: Shows login/register CTA buttons
   - **Authenticated**: Shows user avatar with dropdown menu (same as dashboard)
3. **Static Landing Navbar** (deprecated) - Old static implementation in `app/page.tsx`

## Dashboard Navbar Features

### Conditional Floating Behavior

The dashboard navbar has two states based on scroll position:

#### Not Scrolled (Initial State)
- **Position**: Fixed at top, full width
- **Classes**: `top-0 left-0 right-0 w-full`
- **Particles**: Hidden
- **Content Padding**: Main content has `pt-20` to avoid being hidden behind navbar
- **Purpose**: Traditional navbar feel when page loads

#### Scrolled (> 50px)
- **Position**: Floating and centered
- **Classes**: `top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl`
- **Particles**: Visible with fade-in animation
- **Content Padding**: Same `pt-20` maintains consistent spacing
- **Purpose**: Modern floating effect while browsing

**Layout Implementation:**
All authenticated layouts include `pt-20` (80px) padding-top to ensure content is never hidden behind the navbar:
- `app/dashboard/layout.tsx` - Dashboard layout with `pt-20` on flex container
- `app/admin/layout.tsx` - Admin panel layout with `pt-20` on flex container
- `app/groups/[id]/layout.tsx` - Group pages layout with `pt-20` on main container

### Scroll Detection Implementation

```typescript
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50)
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### Visual Components

#### 1. Floating Particles (Conditional)
Only visible when scrolled:
- 5 particles with different sizes and positions
- 3 animation speeds: slow (6s), medium (4s), fast (3s)
- Colors: blue, purple, pink, indigo, cyan
- Opacity range: 0.3 to 0.6

```typescript
{scrolled && (
  <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none overflow-hidden animate-fade-in">
    <div className="absolute top-10 left-[10%] w-2 h-2 bg-blue-400/30 rounded-full animate-float-slow" />
    <div className="absolute top-20 left-[30%] w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-medium" />
    <div className="absolute top-14 left-[50%] w-2.5 h-2.5 bg-pink-400/30 rounded-full animate-float-fast" />
    <div className="absolute top-8 left-[70%] w-1 h-1 bg-indigo-400/30 rounded-full animate-float-slow" />
    <div className="absolute top-16 left-[85%] w-2 h-2 bg-cyan-400/30 rounded-full animate-float-medium" />
  </div>
)}
```

#### 2. 3D Logo with Holographic Effect

**Components:**
- Multi-layer glow effect (3 layers)
- Gradient ring that pulses
- 3D container with hover transforms
- Plane icon with rotation on hover
- 2 orbiting particles
- Holographic text with blur effect

**Hover Effects:**
- Scale: 1 → 1.10
- Rotation: 0deg → 3deg
- Icon rotation: -45deg → 12deg
- Glow opacity: 0 → 0.4/0.6

```typescript
<Link href="/" className="relative group/logo flex items-center gap-3">
  <div className="relative">
    {/* Outer glow - blue to pink */}
    <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover/logo:opacity-40 blur-2xl transition-all duration-700 animate-pulse-slow" />

    {/* Inner glow - cyan to purple */}
    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl opacity-30 group-hover/logo:opacity-60 blur-xl transition-all duration-500" />

    {/* Logo container */}
    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
      {/* Inner shine */}
      <div className="absolute inset-1 bg-gradient-to-br from-blue-400/50 to-transparent rounded-xl" />

      {/* Plane icon */}
      <Plane className="relative w-7 h-7 text-white transform -rotate-45 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-all duration-700" />
    </div>

    {/* Orbiting particles */}
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full shadow-lg shadow-pink-500/50 animate-bounce" />
    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
  </div>

  {/* Holographic text */}
  <div className="flex flex-col">
    <span className="text-2xl font-black tracking-tight relative">
      {/* Blur layer */}
      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-sm opacity-50" />

      {/* Main text */}
      <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover/logo:from-purple-600 group-hover/logo:via-pink-600 group-hover/logo:to-orange-600 transition-all duration-700">
        TravelHub
      </span>
    </span>

    {/* Tagline */}
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
      <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">
        Live The Journey
      </span>
      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  </div>
</Link>
```

#### 3. Admin Badge (Conditional)

Displays if user is admin:
- Neon glow effect on hover
- Crown icon with sparkles
- Gradient background
- Shine animation

```typescript
{user.role === 'admin' && (
  <div className="relative group/admin">
    {/* Glow effect */}
    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl opacity-0 group-hover/admin:opacity-50 blur-xl transition-all duration-500" />

    <Badge className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 px-4 py-1.5 font-bold text-sm cursor-default">
      {/* Shine effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/admin:translate-x-full transition-transform duration-700" />

      <Crown className="w-4 h-4 mr-1.5 relative z-10" />
      <span className="relative z-10">Admin</span>
      <Sparkles className="w-3 h-3 ml-1.5 relative z-10 animate-pulse" />
    </Badge>
  </div>
)}
```

#### 4. Liquid Morph Avatar

**Features:**
- Multi-layer glow (2 layers)
- Rotating gradient ring
- Avatar with hover effects
- Status indicator
- Scale and rotate on hover

```typescript
<div className="relative">
  {/* Outer glow */}
  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover/avatar:opacity-40 blur-xl transition-all duration-700 animate-pulse-slow" />

  {/* Inner glow */}
  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover/avatar:opacity-60 blur-lg transition-all duration-500" />

  <div className="relative">
    {/* Rotating gradient ring */}
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-spin-slow" />

    <Avatar className="relative h-12 w-12 cursor-pointer border-2 border-white shadow-2xl group-hover/avatar:scale-110 group-hover/avatar:rotate-6 transition-all duration-500">
      <AvatarImage src={user.avatar_url} className="object-cover" />
      <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-black text-sm">
        {getInitials(user.full_name, user.email)}
      </AvatarFallback>
    </Avatar>

    {/* Status indicator */}
    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
  </div>
</div>
```

#### 5. Premium Dropdown Menu

Enhanced dropdown with:
- Gradient borders on hover
- Hover effects on each item
- Travel-themed icons
- Smooth transitions

## Landing Page Navbar (Dynamic)

**Component**: `components/layout/landing-navbar.tsx`

The landing page navbar is a dynamic client component that adapts based on the user's authentication status.

### Authentication Detection

The landing page (`app/page.tsx`) checks authentication server-side and passes user data to the navbar:

```typescript
export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    userProfile = { ...user, ...profile }
  }

  return (
    <div>
      <LandingNavbar user={userProfile} />
      {/* Rest of page */}
    </div>
  )
}
```

### Two States

#### State 1: Not Authenticated (`user === null`)

Shows CTA buttons for login and registration:
- **Login Button** (Ghost): Glassmorphism with hover effects
- **Register Button** (Primary): Gradient with glow and shine effects

#### State 2: Authenticated (`user !== null`)

Shows user interface identical to dashboard navbar:
- **Admin Badge** (if user.role === 'admin'): Link to admin panel
- **User Avatar**: Same liquid morph effect with dropdown menu
- **Dropdown Menu Items**:
  - Dashboard
  - Mi Perfil
  - Configuración
  - Panel Admin (only for admins)
  - Cerrar Sesión

### Key Features

1. **Always Floating**: Fixed floating position, no conditional scroll behavior
2. **Navigation Links**: Has navigation menu for landing sections
3. **Dynamic Right Side**: Shows either CTA buttons or user avatar
4. **Wider Width**: `max-w-7xl` instead of `max-w-6xl` (dashboard)
5. **Particles Always Visible**: Managed by parent page component
6. **Sign Out**: Includes sign out functionality for authenticated users

### Differences from Dashboard Navbar

| Feature | Dashboard Navbar | Landing Navbar |
|---------|-----------------|----------------|
| Scroll Behavior | Conditional (full → floating) | Always floating |
| Particles | Conditional (hidden → visible) | Always visible (page-level) |
| Right Side | Always avatar + admin badge | CTA buttons OR avatar |
| Width | `max-w-6xl` | `max-w-7xl` |
| Navigation | No nav links | Has section links |
| Padding Top | Layout manages `pt-20` | Page manages spacing |

### Navigation Links

Glassmorphism hover effect:
```typescript
<a
  href="#servicios"
  className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-bold text-sm group/nav rounded-2xl hover:bg-white/40 backdrop-blur-sm"
>
  <span className="relative z-10">Servicios</span>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
</a>
```

### CTA Buttons

#### Login Button (Ghost)
- Glassmorphism background
- Subtle border on hover
- Blue color transition

#### Register Button (Primary)
- Gradient background: blue → indigo → purple
- Multi-layer glow effect
- Shine animation on hover
- Scale on hover (1.05)
- Sparkles icon

```typescript
<Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-500 font-bold rounded-2xl group/cta">
  {/* Glow effect */}
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover/cta:opacity-30 blur-lg transition-opacity duration-500" />

  {/* Shine effect */}
  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700" />

  <Sparkles className="w-4 h-4 mr-2 relative z-10 animate-pulse" />
  <span className="relative z-10">Comenzar Gratis</span>
</Button>
```

## Custom Animations

All animations are defined in `app/globals.css`:

### 1. Spin Slow
```css
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
```

### 2. Pulse Slow
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 3. Float Slow
```css
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.6;
  }
}
.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}
```

### 4. Float Medium
```css
@keyframes float-medium {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-25px) translateX(-10px);
    opacity: 0.6;
  }
}
.animate-float-medium {
  animation: float-medium 4s ease-in-out infinite;
}
```

### 5. Float Fast
```css
@keyframes float-fast {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) translateX(15px) scale(1.2);
    opacity: 0.7;
  }
}
.animate-float-fast {
  animation: float-fast 3s ease-in-out infinite;
}
```

### 6. Fade In
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-in;
}
```

## Design Principles

### Glassmorphism
- `backdrop-blur-2xl` for strong blur
- `bg-white/70` for semi-transparent background
- `border border-white/20` for subtle borders
- Shadow with low opacity for depth

### Gradient Strategy
- **Primary**: Blue → Purple → Pink
- **Accent**: Cyan → Blue → Purple
- **Warning/Admin**: Yellow → Orange → Red
- **Success**: Green → Emerald

### Glow Effects
Multiple layers with different properties:
1. **Outer glow**: Large blur (blur-2xl), low opacity (0.3-0.4)
2. **Inner glow**: Medium blur (blur-xl), medium opacity (0.5-0.6)
3. **Accent glow**: Small blur (blur-lg), high opacity (0.6-0.8)

### Transition Timings
- **Fast**: 300ms - Hover states, color changes
- **Medium**: 500ms - Scale, opacity, blur
- **Slow**: 700ms - Rotations, complex transforms

### Z-Index Hierarchy
- Background particles: `z-40`
- Navbar: `z-50`
- Dropdown menu: `z-[100]`
- Relative elements: `z-10` (within parent context)

## Customization Guide

### Change Primary Colors

In all navbar components, replace gradient colors:
```typescript
// Change from blue-purple-pink to green-teal-cyan
from-blue-600 via-purple-600 to-pink-600
// to
from-green-600 via-teal-600 to-cyan-600
```

### Adjust Scroll Threshold

In `components/layout/navbar.tsx`:
```typescript
// Current: 50px
setScrolled(window.scrollY > 50)

// Adjust to trigger earlier (20px) or later (100px)
setScrolled(window.scrollY > 20) // Earlier
setScrolled(window.scrollY > 100) // Later
```

### Modify Particle Count

Add or remove particles in the floating particles section:
```typescript
{scrolled && (
  <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none overflow-hidden animate-fade-in">
    {/* Add more particles here */}
    <div className="absolute top-[custom] left-[custom] w-[size] h-[size] bg-[color] rounded-full animate-[speed]" />
  </div>
)}
```

### Change Animation Speeds

In `app/globals.css`, modify durations:
```css
/* Slower animations */
.animate-float-slow {
  animation: float-slow 10s ease-in-out infinite; /* was 6s */
}

/* Faster animations */
.animate-float-fast {
  animation: float-fast 1.5s ease-in-out infinite; /* was 3s */
}
```

### Disable Floating Behavior

To keep navbar always floating (like landing page):
```typescript
// Remove scroll detection and conditional classes
<nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
  {/* Content */}
</nav>

// And remove conditional particle rendering
<div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none overflow-hidden">
  {/* Particles always visible */}
</div>
```

## Performance Considerations

### Optimizations Applied

1. **Conditional Rendering**: Particles only render when needed (scrolled state)
2. **CSS Animations**: Using CSS keyframes instead of JavaScript for better performance
3. **Pointer Events**: `pointer-events-none` on decorative elements to avoid interfering with clicks
4. **Transform-based Animations**: Using `transform` and `opacity` for 60fps animations
5. **Event Listener Cleanup**: Proper cleanup of scroll listener in useEffect

### Best Practices

- Use `will-change` sparingly for frequently animated elements
- Avoid animating expensive properties like `width`, `height`, `top`, `left`
- Use `transform` and `opacity` for smooth 60fps animations
- Limit the number of simultaneous animations
- Use `requestAnimationFrame` for JavaScript animations if needed

## Browser Support

Tested and working on:
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+

Fallbacks:
- Older browsers will show navbar without blur effects
- CSS animations are widely supported, no fallback needed
- Gradient support is universal

## Accessibility

### Implemented Features

1. **Semantic HTML**: Using `<nav>`, `<header>`, proper heading hierarchy
2. **Keyboard Navigation**: All interactive elements are focusable
3. **Focus Visible**: Native focus indicators on all buttons/links
4. **ARIA Labels**: Dropdown menu has proper ARIA attributes
5. **Color Contrast**: Text meets WCAG AA standards
6. **Reduced Motion**: Consider adding prefers-reduced-motion support

### Future Improvements

Add reduced motion support:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-float-slow,
  .animate-float-medium,
  .animate-float-fast,
  .animate-spin-slow,
  .animate-pulse-slow {
    animation: none;
  }
}
```

## Troubleshooting

### Navbar not floating after scroll

Check:
1. Scroll listener is attached: `console.log(window.scrollY)` in handleScroll
2. Scrolled state is updating: `console.log(scrolled)` in component
3. Conditional classes are applied: Inspect element in DevTools

### Particles not appearing

Check:
1. Conditional rendering: `scrolled` state must be true
2. Z-index conflicts: Particles should be `z-40`, navbar `z-50`
3. Overflow: Parent containers should not have `overflow: hidden`

### Animations not smooth

Check:
1. Browser DevTools Performance tab for janky frames
2. Reduce number of simultaneous animations
3. Ensure using `transform` and `opacity` only
4. Check for CPU-intensive operations running simultaneously

### Blur effect not working

Check:
1. Browser supports `backdrop-filter` (all modern browsers do)
2. Element behind navbar has content (blur needs something to blur)
3. Background opacity is not 1 (use `bg-white/70` not `bg-white`)

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Status**: ✅ Fully Implemented
