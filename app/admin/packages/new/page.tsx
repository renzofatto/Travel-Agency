import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PackageForm from '@/components/packages/package-form'

export const metadata = {
  title: 'Create Package | TravelHub',
  description: 'Create a new travel package',
}

export default async function NewPackagePage() {
  const supabase = await createClient()

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

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/packages">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Travel Package</h1>
        <p className="text-muted-foreground mt-2">
          Create a new travel package template. After creating the package, you&apos;ll be able to add itinerary items.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
          <CardDescription>
            Fill in the basic information for this travel package. You can add detailed itinerary items after creating the package.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackageForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
