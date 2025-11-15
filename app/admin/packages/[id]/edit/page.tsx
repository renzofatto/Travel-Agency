import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import PackageForm from '@/components/packages/package-form'
import PackageItineraryForm from '@/components/packages/package-itinerary-form'
import PackageItineraryList from '@/components/packages/package-itinerary-list'

export const metadata = {
  title: 'Edit Package | TravelHub',
  description: 'Edit travel package',
}

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch package
  const { data: package_, error } = await supabase
    .from('travel_packages')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !package_) {
    notFound()
  }

  // Fetch itinerary items
  const { data: itineraryItems } = await supabase
    .from('package_itinerary_items')
    .select('*')
    .eq('package_id', id)
    .order('day_number', { ascending: true })
    .order('order_index', { ascending: true })

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/packages">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{package_.name}</h1>
        <p className="text-muted-foreground mt-2">
          Edit package details and manage itinerary items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Package Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Update the basic information for this package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PackageForm
                mode="edit"
                defaultValues={{ ...package_, id: package_.id }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Itinerary Management */}
        <div className="space-y-6">
          {/* Add New Item Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Itinerary Item
              </CardTitle>
              <CardDescription>
                Add activities, accommodations, and other items to the itinerary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PackageItineraryForm
                packageId={id}
                mode="create"
                maxDays={package_.duration_days}
              />
            </CardContent>
          </Card>

          {/* Itinerary Items List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
            <PackageItineraryList
              packageId={id}
              items={itineraryItems || []}
              maxDays={package_.duration_days}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
