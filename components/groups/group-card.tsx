import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    destination: string
    start_date: string
    end_date: string
    cover_image: string | null
    member_count?: number
    user_role?: 'leader' | 'member'
  }
}

export default function GroupCard({ group }: GroupCardProps) {
  const startDate = new Date(group.start_date)
  const endDate = new Date(group.end_date)
  const isUpcoming = startDate > new Date()
  const isPast = endDate < new Date()

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden">
          {group.cover_image ? (
            <img
              src={group.cover_image}
              alt={group.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white/50" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isUpcoming && (
              <Badge className="bg-green-500 hover:bg-green-600">
                Upcoming
              </Badge>
            )}
            {isPast && (
              <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
                Past
              </Badge>
            )}
            {!isUpcoming && !isPast && (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                Active
              </Badge>
            )}
          </div>

          {/* Role Badge */}
          {group.user_role === 'leader' && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-purple-500 hover:bg-purple-600">
                Leader
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Group Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {group.name}
          </h3>

          {/* Destination */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{group.destination}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {group.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-gray-100">
          {/* Member Count */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {group.member_count || 0} {group.member_count === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* View Details */}
          <span className="text-sm text-blue-600 font-medium group-hover:underline">
            View details →
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
