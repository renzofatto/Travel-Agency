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
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col pt-20 lg:pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            {/* Primary navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Divider */}
            <div className="pt-6">
              <div className="border-t border-gray-200" />
            </div>

            {/* Secondary navigation */}
            <div className="pt-6 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium">TravelHub</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
