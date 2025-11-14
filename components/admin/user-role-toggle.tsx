'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Shield, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateUserRole } from '@/lib/actions/admin-actions'

interface UserRoleToggleProps {
  userId: string
  currentRole: 'admin' | 'user'
  userEmail: string
}

export default function UserRoleToggle({
  userId,
  currentRole,
  userEmail,
}: UserRoleToggleProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleRole = async () => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'promote to admin' : 'remove admin privileges'

    if (!confirm(`Are you sure you want to ${action} for ${userEmail}?`)) {
      return
    }

    setIsUpdating(true)

    const result = await updateUserRole(userId, newRole)

    setIsUpdating(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`User role updated to ${newRole}`)
      router.refresh()
    }
  }

  return (
    <Button
      size="sm"
      variant={currentRole === 'admin' ? 'default' : 'outline'}
      onClick={handleToggleRole}
      disabled={isUpdating}
      className={currentRole === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : ''}
    >
      {isUpdating ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : currentRole === 'admin' ? (
        <Shield className="w-4 h-4 mr-1" />
      ) : (
        <User className="w-4 h-4 mr-1" />
      )}
      {currentRole === 'admin' ? 'Admin' : 'User'}
    </Button>
  )
}
