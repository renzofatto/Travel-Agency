'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Calendar, Shield, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EditProfileForm from '@/components/profile/edit-profile-form'
import EditAvatarDialog from '@/components/profile/edit-avatar-dialog'

interface ProfileContentProps {
  user: {
    id: string
    email?: string
    created_at: string
  }
  profile: {
    full_name: string | null
    avatar_url: string | null
    role: string
    created_at: string
    group_members?: any[]
  } | null
}

export default function ProfileContent({ user, profile }: ProfileContentProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const getInitials = (name?: string | null, email?: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const totalGroups = profile?.group_members?.length || 0
  const leaderGroups =
    profile?.group_members?.filter((m: any) => m.role === 'leader').length || 0
  const memberGroups = totalGroups - leaderGroups

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">View and edit your profile information</p>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-start justify-between -mt-16 mb-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-3xl">
                  {getInitials(profile?.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              <EditAvatarDialog
                currentAvatar={profile?.avatar_url}
                userName={profile?.full_name || user.email || 'User'}
              />
            </div>
            {profile?.role === 'admin' && (
              <Badge className="bg-purple-100 text-purple-700 mt-20">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
                <p className="text-sm text-gray-600">Total Groups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {leaderGroups}
                </p>
                <p className="text-sm text-gray-600">As Leader</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {memberGroups}
                </p>
                <p className="text-sm text-gray-600">As Member</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm">{profile?.full_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm">
                    {formatDate(profile?.created_at || user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm capitalize">
                    {profile?.role || 'user'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      {totalGroups > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Groups
          </h3>
          <div className="space-y-3">
            {profile?.group_members?.map((membership: any) => (
              <div
                key={membership.group_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {membership.travel_groups?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {membership.travel_groups?.destination}
                  </p>
                </div>
                <Badge
                  variant={
                    membership.role === 'leader' ? 'default' : 'secondary'
                  }
                >
                  {membership.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <EditProfileForm
            defaultValues={{
              full_name: profile?.full_name || '',
              email: user.email || '',
            }}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
