import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminStats } from '@/lib/actions/admin-actions'
import StatsCard from '@/components/admin/stats-card'
import {
  Users,
  Plane,
  DollarSign,
  Image,
  FileText,
  StickyNote,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get current user
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

  if (userProfile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get admin stats
  const statsResult = await getAdminStats()

  if (statsResult.error || !statsResult.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load admin statistics</p>
      </div>
    )
  }

  const stats = statsResult.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Platform overview and management
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/admin/users">
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </Link>
        <Link href="/admin/groups">
          <Button variant="outline">
            <Plane className="w-4 h-4 mr-2" />
            View All Groups
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Total Groups"
          value={stats.totalGroups}
          icon={Plane}
          colorClass="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Active Groups"
          value={stats.activeGroups}
          icon={TrendingUp}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatsCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toLocaleString()}`}
          icon={DollarSign}
          colorClass="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Content Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Photos"
            value={stats.totalPhotos}
            icon={Image}
            colorClass="bg-pink-100 text-pink-600"
          />
          <StatsCard
            title="Total Documents"
            value={stats.totalDocuments}
            icon={FileText}
            colorClass="bg-indigo-100 text-indigo-600"
          />
          <StatsCard
            title="Total Notes"
            value={stats.totalNotes}
            icon={StickyNote}
            colorClass="bg-orange-100 text-orange-600"
          />
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Health</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Groups per User</span>
            <span className="font-semibold">
              {stats.totalUsers > 0
                ? (stats.totalGroups / stats.totalUsers).toFixed(1)
                : '0'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active Group Rate</span>
            <span className="font-semibold">
              {stats.totalGroups > 0
                ? `${((stats.activeGroups / stats.totalGroups) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Photos per Group</span>
            <span className="font-semibold">
              {stats.totalGroups > 0
                ? (stats.totalPhotos / stats.totalGroups).toFixed(1)
                : '0'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Documents per Group</span>
            <span className="font-semibold">
              {stats.totalGroups > 0
                ? (stats.totalDocuments / stats.totalGroups).toFixed(1)
                : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
