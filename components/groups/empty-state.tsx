import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'
import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
        <MapPin className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No travel groups yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start your journey by creating your first travel group. Invite friends, plan your
        itinerary, and track expenses together!
      </p>
      <Link href="/dashboard/groups/new">
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Group
        </Button>
      </Link>
    </div>
  )
}
