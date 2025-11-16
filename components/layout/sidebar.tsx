'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Settings,
  Menu,
  X,
  Shield,
  Package,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isAdmin?: boolean
}

const getNavigation = (isAdmin: boolean) => {
  const nav = [
    { name: 'My Groups', href: '/dashboard', icon: Users },
  ]

  if (isAdmin) {
    nav.push(
      { name: 'Admin Panel', href: '/admin', icon: Shield },
      { name: 'Travel Packages', href: '/admin/packages', icon: Package }
    )
  }

  return nav
}

const secondaryNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigation = getNavigation(isAdmin)

  return (
    <>
      {/* Mobile menu button - Mejorado con glassmorphism y mejor posición */}
      <button
        type="button"
        className={cn(
          'lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-500 group',
          'backdrop-blur-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600',
          'hover:scale-110 hover:rotate-6 hover:shadow-blue-500/50',
          'border-2 border-white/20'
        )}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500" />
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-white relative z-10 transition-transform duration-300 group-hover:rotate-90" />
        ) : (
          <Menu className="h-6 w-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
        )}
      </button>

      {/* Mobile backdrop - Mejorado con blur */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mejorado con glassmorphism */}
      <aside
        className={cn(
          'fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-72 transform transition-all duration-500 ease-out lg:self-start',
          'backdrop-blur-2xl bg-white/95 border-r border-white/20 shadow-2xl',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Gradient overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 pointer-events-none" />

        <div className="relative h-screen lg:h-auto lg:min-h-[calc(100vh-64px)] flex flex-col pt-24 lg:pt-8 pb-6 overflow-y-auto">
          <nav className="flex-1 px-5 space-y-2">
            {/* Primary navigation */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'group relative flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600'
                    )}
                  >
                    {/* Glow effect para activo */}
                    {isActive && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-30 blur-lg" />
                    )}

                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-300',
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                      )}
                    />
                    <span className="relative z-10">{item.name}</span>

                    {/* Indicador de activo */}
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Divider mejorado */}
            <div className="pt-6 pb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs font-bold text-gray-400 bg-white/50 backdrop-blur-sm rounded-full">
                    More
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary navigation */}
            <div className="space-y-2">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'group relative flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600'
                    )}
                  >
                    {/* Glow effect para activo */}
                    {isActive && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-30 blur-lg" />
                    )}

                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-300',
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-purple-600 group-hover:scale-110'
                      )}
                    />
                    <span className="relative z-10">{item.name}</span>

                    {/* Indicador de activo */}
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar footer mejorado */}
          <div className="px-5 pt-6 mt-6">
            <div className="relative p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10" />

              <div className="relative text-xs">
                <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-sm mb-1">
                  TravelHub
                </p>
                <p className="text-gray-500 font-medium">Version 1.0.0</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-bold">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
