'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plane,
  Sparkles,
  LogOut,
  Settings,
  User as UserIcon,
  Shield,
  LayoutDashboard,
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LandingNavbarProps {
  user: (User & {
    full_name?: string
    avatar_url?: string
    role?: 'admin' | 'user'
  }) | null
}

export default function LandingNavbar({ user }: LandingNavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      {/* Glassmorphism container with animated border */}
      <div className="relative group">
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

        {/* Main navbar */}
        <div className="relative backdrop-blur-2xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl shadow-black/5">
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />

          <div className="relative container mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo con efecto 3D */}
            <Link href="/" className="relative group/logo flex items-center gap-3">
              <div className="relative">
                {/* Glow layers */}
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover/logo:opacity-40 blur-2xl transition-all duration-700 animate-pulse-slow" />
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl opacity-30 group-hover/logo:opacity-60 blur-xl transition-all duration-500" />

                {/* Logo container with 3D effect */}
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                  {/* Inner glow */}
                  <div className="absolute inset-1 bg-gradient-to-br from-blue-400/50 to-transparent rounded-xl" />
                  <Plane className="relative w-7 h-7 text-white transform -rotate-45 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-all duration-700" />
                </div>

                {/* Orbiting particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full shadow-lg shadow-pink-500/50 animate-bounce" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
              </div>

              {/* Logo text con efecto holográfico */}
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight relative">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-sm opacity-50" />
                  <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover/logo:from-purple-600 group-hover/logo:via-pink-600 group-hover/logo:to-orange-600 transition-all duration-700">
                    TravelHub
                  </span>
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                    Live The Journey
                  </span>
                  <div className="w-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </Link>

            {/* Navigation con efecto glassmorphism */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link
                href="/#servicios"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-bold text-sm group/nav rounded-2xl hover:bg-white/40 backdrop-blur-sm"
              >
                <span className="relative z-10">Servicios</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/paquetes"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-bold text-sm group/nav rounded-2xl hover:bg-white/40 backdrop-blur-sm"
              >
                <span className="relative z-10">Paquetes</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/#plataforma"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-bold text-sm group/nav rounded-2xl hover:bg-white/40 backdrop-blur-sm"
              >
                <span className="relative z-10">Plataforma</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/#testimonios"
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-bold text-sm group/nav rounded-2xl hover:bg-white/40 backdrop-blur-sm"
              >
                <span className="relative z-10">Testimonios</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
              </Link>
            </nav>

            {/* Right side - CTA Buttons o Avatar */}
            {user ? (
              // Usuario autenticado - Mostrar avatar con dropdown
              <div className="flex items-center gap-4">
                {/* Admin badge */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="group/admin relative hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm overflow-hidden transition-all duration-500 bg-white/60 backdrop-blur-xl text-purple-600 hover:scale-105 hover:shadow-xl border border-purple-200/50"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-0 group-hover/admin:opacity-30 blur-lg transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-0 group-hover/admin:opacity-100 transition-opacity duration-500" />
                    <Shield className="w-4 h-4 relative z-10 transition-all duration-300 group-hover/admin:text-white" />
                    <span className="relative z-10 transition-all duration-300 group-hover/admin:text-white">Admin</span>
                    <Sparkles className="w-3.5 h-3.5 relative z-10 transition-all duration-300 group-hover/admin:text-white" />
                  </Link>
                )}

                {/* Avatar con dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none group/avatar">
                    <div className="relative">
                      {/* Multi-layer glow effect */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover/avatar:opacity-40 blur-xl transition-all duration-700 animate-pulse-slow" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover/avatar:opacity-60 blur-lg transition-all duration-500" />

                      {/* Rotating gradient ring */}
                      <div className="relative">
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
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-80 p-3 backdrop-blur-2xl bg-white/95 border border-white/40 shadow-2xl rounded-3xl mt-3"
                  >
                    {/* User info */}
                    <DropdownMenuLabel className="p-0">
                      <div className="relative p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl mb-3 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10" />

                        <div className="relative flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 blur-md" />
                            <Avatar className="relative h-16 w-16 border-3 border-white shadow-xl">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-black text-lg">
                                {getInitials(user.full_name, user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-black text-gray-900 truncate mb-0.5">
                              {user.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-600 truncate mb-2">
                              {user.email}
                            </p>
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg">
                                <Shield className="w-3 h-3" />
                                Administrator
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <div className="space-y-1">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                        >
                          <div className="p-2.5 rounded-xl bg-blue-100 group-hover/item:bg-blue-200 group-hover/item:scale-110 transition-all duration-300">
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover/item:text-blue-600 transition-colors">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/profile"
                          className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                        >
                          <div className="p-2.5 rounded-xl bg-indigo-100 group-hover/item:bg-indigo-200 group-hover/item:scale-110 transition-all duration-300">
                            <UserIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover/item:text-indigo-600 transition-colors">Mi Perfil</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                        >
                          <div className="p-2.5 rounded-xl bg-purple-100 group-hover/item:bg-purple-200 group-hover/item:scale-110 transition-all duration-300">
                            <Settings className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover/item:text-purple-600 transition-colors">Configuración</span>
                        </Link>
                      </DropdownMenuItem>

                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin"
                              className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300"
                            >
                              <div className="p-2.5 rounded-xl bg-orange-100 group-hover/item:bg-orange-200 group-hover/item:scale-110 transition-all duration-300">
                                <Shield className="h-4 w-4 text-orange-600" />
                              </div>
                              <span className="text-sm font-bold text-gray-700 group-hover/item:text-orange-600 transition-colors flex-1">Panel Admin</span>
                              <Sparkles className="w-4 h-4 text-orange-400 group-hover/item:text-orange-600 group-hover/item:animate-pulse" />
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300"
                      >
                        <div className="p-2.5 rounded-xl bg-red-100 group-hover/item:bg-red-200 group-hover/item:scale-110 transition-all duration-300">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-bold text-red-600">Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Usuario no autenticado - Mostrar botones de CTA
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="hidden sm:flex font-bold hover:bg-white/60 backdrop-blur-xl hover:text-blue-600 transition-all duration-300 rounded-2xl border border-transparent hover:border-blue-200/50 hover:shadow-lg"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-500 font-bold rounded-2xl group/cta">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover/cta:opacity-30 blur-lg transition-opacity duration-500" />

                    {/* Shine effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700" />

                    <Sparkles className="w-4 h-4 mr-2 relative z-10 animate-pulse" />
                    <span className="relative z-10">Comenzar Gratis</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
