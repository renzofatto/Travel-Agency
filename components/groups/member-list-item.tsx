'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { MoreVertical, Shield, Trash2, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { removeMember, toggleLeaderRole } from '@/lib/actions/member-actions'
import { format } from 'date-fns'

interface MemberListItemProps {
  member: {
    user_id: string
    role: 'leader' | 'member'
    joined_at: string
    user: {
      full_name?: string
      email: string
      avatar_url?: string
    }
  }
  groupId: string
  canManage: boolean
  currentUserId: string
}

export default function MemberListItem({
  member,
  groupId,
  canManage,
  currentUserId,
}: MemberListItemProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRemove = async () => {
    setIsLoading(true)
    const result = await removeMember(groupId, member.user_id)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success('Member removed')
  }

  const handleToggleLeader = async () => {
    setIsLoading(true)
    const result = await toggleLeaderRole(groupId, member.user_id, member.role)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success(
      member.role === 'leader'
        ? 'Leader role removed'
        : 'Promoted to leader'
    )
    setIsLoading(false)
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

  const isCurrentUser = member.user_id === currentUserId

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <Avatar className="h-12 w-12">
        <AvatarImage src={member.user.avatar_url} />
        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          {getInitials(member.user.full_name, member.user.email)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {member.user.full_name || 'User'}
            {isCurrentUser && (
              <span className="text-gray-500 font-normal ml-1">(You)</span>
            )}
          </h3>
          {member.role === 'leader' && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-xs">Leader</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-600 truncate">{member.user.email}</p>
          <span className="text-xs text-gray-400">
            Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Actions */}
      {canManage && !isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleLeader}>
              <Shield className="mr-2 h-4 w-4" />
              {member.role === 'leader' ? 'Remove Leader Role' : 'Make Leader'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
