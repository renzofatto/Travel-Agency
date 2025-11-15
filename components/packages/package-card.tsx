'use client'

import Link from 'next/link'
import { MapPin, Calendar, DollarSign, TrendingUp, Edit, Trash2, Package } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deletePackage, togglePackageActive } from '@/lib/actions/package-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import AssignPackageDialog from './assign-package-dialog'

interface PackageCardProps {
  package_: {
    id: string
    name: string
    description: string | null
    destination: string
    duration_days: number
    cover_image: string | null
    price_estimate: number | null
    difficulty_level: string | null
    is_active: boolean
    package_itinerary_items?: { count: number }[]
  }
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  challenging: 'bg-red-100 text-red-800',
}

const difficultyLabels = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
}

export default function PackageCard({ package_: pkg }: PackageCardProps) {
  const router = useRouter()
  const itemCount = pkg.package_itinerary_items?.[0]?.count || 0

  async function handleDelete() {
    const result = await deletePackage(pkg.id)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Package deleted successfully')
      router.refresh()
    }
  }

  async function handleToggleActive() {
    const result = await togglePackageActive(pkg.id, !pkg.is_active)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Package ${!pkg.is_active ? 'activated' : 'deactivated'} successfully`)
      router.refresh()
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {pkg.cover_image ? (
          <img
            src={pkg.cover_image}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            📦
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
            {pkg.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {pkg.difficulty_level && (
            <Badge className={difficultyColors[pkg.difficulty_level as keyof typeof difficultyColors]}>
              {difficultyLabels[pkg.difficulty_level as keyof typeof difficultyLabels]}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{pkg.name}</h3>
        {pkg.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{pkg.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Destination */}
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span>{pkg.destination}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'}</span>
          <span className="mx-2">•</span>
          <span>{itemCount} activities</span>
        </div>

        {/* Price Estimate */}
        {pkg.price_estimate && (
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span>From ${pkg.price_estimate.toLocaleString()}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t pt-4">
        <div className="flex gap-2 w-full">
          <Link href={`/admin/packages/${pkg.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleActive}
          >
            {pkg.is_active ? 'Deactivate' : 'Activate'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Package</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                  Groups that were created from this package will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {pkg.is_active && (
          <AssignPackageDialog
            packageId={pkg.id}
            trigger={
              <Button variant="default" className="w-full" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Assign to Group
              </Button>
            }
          />
        )}
      </CardFooter>
    </Card>
  )
}
