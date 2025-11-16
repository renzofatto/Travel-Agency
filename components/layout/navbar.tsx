'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
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
  LogOut,
  Settings,
  User as UserIcon,
  Shield,
  Plane,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  user: User & {
    full_name?: string
    avatar_url?: string
    role?: 'admin' | 'user'
  }
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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

  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Floating particles background - only visible when scrolled */}
      {scrolled && (
        <div className="fixed top-0 left-0 right-0 h-32 z-40 pointer-events-none overflow-hidden animate-fade-in">
          <div className="absolute top-10 left-[10%] w-2 h-2 bg-blue-400/30 rounded-full animate-float-slow" />
          <div className="absolute top-20 left-[30%] w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-medium" />
          <div className="absolute top-14 left-[50%] w-2.5 h-2.5 bg-pink-400/30 rounded-full animate-float-fast" />
          <div className="absolute top-8 left-[70%] w-1 h-1 bg-indigo-400/30 rounded-full animate-float-slow" />
          <div className="absolute top-16 left-[85%] w-2 h-2 bg-cyan-400/30 rounded-full animate-float-medium" />
        </div>
      )}

      <nav
        className={cn(
          'fixed z-50 transition-all duration-700',
          scrolled
            ? 'top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl'
            : 'top-0 left-0 right-0 w-full'
        )}
      >
        {/* Glassmorphism container with animated border */}
        <div className="relative group">
          {/* Animated gradient border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

          {/* Main navbar */}
          <div className={cn(
            'relative backdrop-blur-2xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl shadow-black/5 transition-all duration-500',
            scrolled && 'bg-white/80'
          )}>
            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />

            <div className={cn(
              'relative flex justify-between items-center transition-all duration-500',
              scrolled ? 'px-4 py-3' : 'px-6 py-4'
            )}>
              {/* Logo con efecto 3D */}
              <Link href="/" className={cn(
                'relative group/logo flex items-center transition-all duration-500',
                scrolled ? 'gap-2' : 'gap-3'
              )}>
                <div className="relative">
                  {/* Glow layers */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover/logo:opacity-40 blur-2xl transition-all duration-700 animate-pulse-slow" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl opacity-30 group-hover/logo:opacity-60 blur-xl transition-all duration-500" />

                  {/* Logo container with 3D effect */}
                  <div className={cn(
                    'relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500',
                    scrolled ? 'w-11 h-11' : 'w-14 h-14'
                  )}>
                    {/* Inner glow */}
                    <div className="absolute inset-1 bg-gradient-to-br from-blue-400/50 to-transparent rounded-xl" />
                    <Plane className={cn(
                      'relative text-white transform -rotate-45 group-hover/logo:rotate-12 group-hover/logo:scale-110 transition-all duration-700',
                      scrolled ? 'w-5 h-5' : 'w-7 h-7'
                    )} />
                  </div>

                  {/* Orbiting particles */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full shadow-lg shadow-pink-500/50 animate-bounce" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
                </div>

                {/* Logo text con efecto holográfico */}
                <div className="flex flex-col">
                  <span className={cn(
                    'font-black tracking-tight relative transition-all duration-500',
                    scrolled ? 'text-xl' : 'text-2xl'
                  )}>
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-sm opacity-50" />
                    <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover/logo:from-purple-600 group-hover/logo:via-pink-600 group-hover/logo:to-orange-600 transition-all duration-700">
                      TravelHub
                    </span>
                  </span>
                  {!scrolled && (
                    <div className="flex items-center gap-1.5 mt-0.5 animate-fade-in">
                      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                        Live The Journey
                      </span>
                      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  )}
                </div>
              </Link>

              {/* Right side */}
              <div className={cn(
                'flex items-center transition-all duration-500',
                scrolled ? 'gap-3' : 'gap-4'
              )}>
                {/* Admin badge con efecto neon */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={cn(
                      'group/admin relative hidden sm:flex items-center rounded-full font-bold overflow-hidden transition-all duration-500',
                      scrolled ? 'gap-1.5 px-4 py-2 text-xs' : 'gap-2 px-5 py-2.5 text-sm',
                      pathname?.startsWith('/admin')
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-2xl shadow-purple-500/50 scale-105'
                        : 'bg-white/60 backdrop-blur-xl text-purple-600 hover:scale-105 hover:shadow-xl border border-purple-200/50'
                    )}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-0 group-hover/admin:opacity-30 blur-lg transition-opacity duration-500" />

                    {/* Animated background on hover */}
                    {!pathname?.startsWith('/admin') && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-0 group-hover/admin:opacity-100 transition-opacity duration-500" />
                    )}

                    <Shield className={cn(
                      'relative z-10 transition-all duration-300',
                      scrolled ? 'w-3.5 h-3.5' : 'w-4 h-4',
                      !pathname?.startsWith('/admin') && 'group-hover/admin:text-white'
                    )} />
                    <span className={cn(
                      'relative z-10 transition-all duration-300',
                      !pathname?.startsWith('/admin') && 'group-hover/admin:text-white'
                    )}>
                      Admin
                    </span>
                    <Sparkles className={cn(
                      'relative z-10 transition-all duration-300',
                      scrolled ? 'w-3 h-3' : 'w-3.5 h-3.5',
                      pathname?.startsWith('/admin') ? 'animate-pulse' : 'group-hover/admin:text-white'
                    )} />
                  </Link>
                )}

                {/* Avatar con efecto liquid morph */}
                {mounted ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none group/avatar">
                      <div className="relative">
                        {/* Multi-layer glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover/avatar:opacity-40 blur-xl transition-all duration-700 animate-pulse-slow" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover/avatar:opacity-60 blur-lg transition-all duration-500" />

                        {/* Rotating gradient ring */}
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-spin-slow" />

                          {/* Avatar with morphing effect */}
                          <Avatar className={cn(
                            'relative cursor-pointer border-2 border-white shadow-2xl group-hover/avatar:scale-110 group-hover/avatar:rotate-6 transition-all duration-500',
                            scrolled ? 'h-10 w-10' : 'h-12 w-12'
                          )}>
                            <AvatarImage src={user.avatar_url} className="object-cover" />
                            <AvatarFallback className={cn(
                              'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-black',
                              scrolled ? 'text-xs' : 'text-sm'
                            )}>
                              {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Status indicator */}
                          <div className={cn(
                            'absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse transition-all duration-500',
                            scrolled ? 'w-3 h-3' : 'w-3.5 h-3.5'
                          )} />
                        </div>
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-80 p-3 backdrop-blur-2xl bg-white/95 border border-white/40 shadow-2xl rounded-3xl mt-3"
                    >
                      {/* User info con diseño premium */}
                      <DropdownMenuLabel className="p-0">
                        <div className="relative p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl mb-3 overflow-hidden">
                          {/* Animated mesh gradient */}
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
                            href="/dashboard/profile"
                            className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                          >
                            <div className="p-2.5 rounded-xl bg-blue-100 group-hover/item:bg-blue-200 group-hover/item:scale-110 transition-all duration-300">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover/item:text-blue-600 transition-colors">Mi Perfil</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard/settings"
                            className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                          >
                            <div className="p-2.5 rounded-xl bg-indigo-100 group-hover/item:bg-indigo-200 group-hover/item:scale-110 transition-all duration-300">
                              <Settings className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover/item:text-indigo-600 transition-colors">Configuración</span>
                          </Link>
                        </DropdownMenuItem>

                        {user.role === 'admin' && (
                          <>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem asChild>
                              <Link
                                href="/admin"
                                className="group/item cursor-pointer flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                              >
                                <div className="p-2.5 rounded-xl bg-purple-100 group-hover/item:bg-purple-200 group-hover/item:scale-110 transition-all duration-300">
                                  <Shield className="h-4 w-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover/item:text-purple-600 transition-colors flex-1">Panel Admin</span>
                                <Sparkles className="w-4 h-4 text-purple-400 group-hover/item:text-purple-600 group-hover/item:animate-pulse" />
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
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-40 animate-pulse" />
                    <Avatar className={cn(
                      'relative border-2 border-white shadow-2xl transition-all duration-500',
                      scrolled ? 'h-10 w-10' : 'h-12 w-12'
                    )}>
                      <AvatarFallback className={cn(
                        'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-black',
                        scrolled ? 'text-xs' : 'text-sm'
                      )}>
                        {getInitials(user.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 bg-gray-300 rounded-full border-2 border-white animate-pulse transition-all duration-500',
                      scrolled ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
