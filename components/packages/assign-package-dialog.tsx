'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, Loader2, Package } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  assignPackageToGroupSchema,
  type AssignPackageToGroupInput,
} from '@/lib/validations/package'
import { assignPackageToGroup } from '@/lib/actions/package-actions'
import { createClient } from '@/lib/supabase/client'

interface Package {
  id: string
  name: string
  destination: string
  duration_days: number
}

interface Group {
  id: string
  name: string
  destination: string | null
}

interface AssignPackageDialogProps {
  /** Pre-selected package ID (if coming from package page) */
  packageId?: string
  /** Pre-selected group ID (if coming from group settings) */
  groupId?: string
  /** Optional trigger button (if not provided, uses default button) */
  trigger?: React.ReactNode
}

export default function AssignPackageDialog({
  packageId,
  groupId,
  trigger,
}: AssignPackageDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<AssignPackageToGroupInput>({
    resolver: zodResolver(assignPackageToGroupSchema),
    defaultValues: {
      package_id: packageId || '',
      group_id: groupId || '',
      start_date: '',
    },
  })

  // Calculate suggested start date (tomorrow)
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Load packages and groups when dialog opens
  useEffect(() => {
    if (!open) return

    async function loadData() {
      setIsLoading(true)

      try {
        // Load packages (only active ones)
        const { data: packagesData } = await supabase
          .from('travel_packages')
          .select('id, name, destination, duration_days')
          .eq('is_active', true)
          .order('name')

        setPackages(packagesData || [])

        // Load groups (all groups)
        const { data: groupsData } = await supabase
          .from('travel_groups')
          .select('id, name, destination')
          .order('name')

        setGroups(groupsData || [])

        // Set default start date to tomorrow
        if (!form.getValues('start_date')) {
          form.setValue('start_date', getTomorrowDate())
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load packages and groups')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [open, supabase, form])

  async function onSubmit(data: AssignPackageToGroupInput) {
    setIsSubmitting(true)

    try {
      const result = await assignPackageToGroup(data)

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success('Package assigned successfully! Itinerary has been copied to the group.')
      router.refresh()
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPackage = packages.find((p) => p.id === form.watch('package_id'))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Assign Package
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Package to Group</DialogTitle>
          <DialogDescription>
            Select a package and group. The package itinerary will be copied to the group as an
            independent copy that can be edited separately.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Package Selection */}
              {!packageId && (
                <FormField
                  control={form.control}
                  name="package_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a package" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {packages.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No active packages available
                            </div>
                          ) : (
                            packages.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} ({pkg.duration_days} days)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose the package to assign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Group Selection */}
              {!groupId && (
                <FormField
                  control={form.control}
                  name="group_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No groups available
                            </div>
                          ) : (
                            groups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                                {group.destination && ` - ${group.destination}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose the group to receive the package</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When does the trip start? Itinerary dates will be calculated from this date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Package Info Preview */}
              {selectedPackage && (
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <Package className="w-4 h-4" />
                    {selectedPackage.name}
                  </div>
                  <div className="text-muted-foreground">
                    Destination: {selectedPackage.destination}
                  </div>
                  <div className="text-muted-foreground">
                    Duration: {selectedPackage.duration_days} days
                  </div>
                  {form.watch('start_date') && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Trip ends on:{' '}
                      {new Date(
                        new Date(form.watch('start_date')).getTime() +
                          (selectedPackage.duration_days - 1) * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting || packages.length === 0 || groups.length === 0}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Package'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
