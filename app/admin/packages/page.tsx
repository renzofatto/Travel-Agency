import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PackageCard from '@/components/packages/package-card'
import PackageStats from '@/components/packages/package-stats'

export default async function PackagesPage() {
  const supabase = await createClient()

  // Check authentication and admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch all packages with itinerary item counts
  const { data: packages, error } = await supabase
    .from('travel_packages')
    .select(`
      *,
      package_itinerary_items(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching packages:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading packages. Please try again later.</p>
      </div>
    )
  }

  const packagesData = packages || []

  // Calculate stats
  const activePackages = packagesData.filter((p) => p.is_active)
  const inactivePackages = packagesData.filter((p) => !p.is_active)
  const avgDuration =
    packagesData.length > 0
      ? packagesData.reduce((sum, p) => sum + p.duration_days, 0) / packagesData.length
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Packages</h1>
          <p className="text-gray-600 mt-1">
            Create and manage travel package templates for groups
          </p>
        </div>
        <Link href="/admin/packages/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <PackageStats
        total={packagesData.length}
        active={activePackages.length}
        inactive={inactivePackages.length}
        avgDuration={avgDuration}
      />

      {/* Packages List */}
      {packagesData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first travel package to get started
          </p>
          <Link href="/admin/packages/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({packagesData.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activePackages.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactivePackages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packagesData.map((pkg) => (
                <PackageCard key={pkg.id} package_={pkg} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {activePackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePackages.map((pkg) => (
                  <PackageCard key={pkg.id} package_={pkg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No active packages</div>
            )}
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            {inactivePackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactivePackages.map((pkg) => (
                  <PackageCard key={pkg.id} package_={pkg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No inactive packages</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
