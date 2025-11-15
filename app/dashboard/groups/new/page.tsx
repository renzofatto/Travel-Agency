import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GroupForm from '@/components/groups/group-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewGroupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userProfile?.role === 'admin'

  // Only admins can create groups
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
        <p className="text-gray-600 mt-2">
          As an administrator, create a new travel group and assign a leader
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <GroupForm mode="create" isAdmin={isAdmin} />
      </div>
    </div>
  )
}
