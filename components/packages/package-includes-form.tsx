'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Edit2, X, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  createPackageIncludedItem,
  updatePackageIncludedItem,
  deletePackageIncludedItem,
  createPackageExcludedItem,
  updatePackageExcludedItem,
  deletePackageExcludedItem,
} from '@/lib/actions/package-actions'
import {
  packageIncludedItemBaseSchema,
  packageExcludedItemBaseSchema,
  type PackageIncludedItemInput,
  type PackageExcludedItemInput,
} from '@/lib/validations/package'

// ============================================
// TYPES
// ============================================

type IncludedItem = {
  id: string
  title: string
  description: string | null
  icon: string | null
  order_index: number
}

type ExcludedItem = {
  id: string
  title: string
  description: string | null
  icon: string | null
  order_index: number
}

type PackageIncludesFormProps = {
  packageId: string
  includedItems: IncludedItem[]
  excludedItems: ExcludedItem[]
}

// ============================================
// INCLUDED ITEMS COMPONENT
// ============================================

function IncludedItemsList({
  packageId,
  items,
}: {
  packageId: string
  items: IncludedItem[]
}) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(packageIncludedItemBaseSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      order_index: items.length,
    },
  })

  const editForm = useForm({
    resolver: zodResolver(packageIncludedItemBaseSchema),
  })

  async function onAdd(data: PackageIncludedItemInput) {
    const result = await createPackageIncludedItem({
      ...data,
      package_id: packageId,
    })

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Item added successfully')
    form.reset({
      title: '',
      description: '',
      icon: '',
      order_index: items.length + 1,
    })
    setIsAdding(false)
    router.refresh()
  }

  async function onUpdate(itemId: string, data: PackageIncludedItemInput) {
    const result = await updatePackageIncludedItem({
      ...data,
      id: itemId,
      package_id: packageId,
    })

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Item updated successfully')
    setEditingId(null)
    router.refresh()
  }

  async function onDelete(itemId: string) {
    setDeletingId(itemId)
    const result = await deletePackageIncludedItem(itemId, packageId)

    if (result?.error) {
      toast.error(result.error)
      setDeletingId(null)
      return
    }

    toast.success('Item deleted successfully')
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* List of items */}
      {items.map((item) => {
        const isEditing = editingId === item.id

        if (isEditing) {
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <form
                  onSubmit={editForm.handleSubmit((data) => onUpdate(item.id, data))}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      {...editForm.register('icon')}
                      placeholder="🏨"
                      className="col-span-2"
                      maxLength={10}
                    />
                    <Input
                      {...editForm.register('title')}
                      placeholder="Title"
                      className="col-span-10"
                      required
                    />
                  </div>
                  <Textarea
                    {...editForm.register('description')}
                    placeholder="Description (optional)"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <span className="text-2xl">{item.icon || '✅'}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(item.id)
                    editForm.reset({
                      title: item.title,
                      description: item.description || '',
                      icon: item.icon || '',
                      order_index: item.order_index,
                    })
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add new item form */}
      {isAdding ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <Input
                  {...form.register('icon')}
                  placeholder="🏨"
                  className="col-span-2"
                  maxLength={10}
                />
                <Input
                  {...form.register('title')}
                  placeholder="Title (e.g., Accommodation)"
                  className="col-span-10"
                  required
                />
              </div>
              <Textarea
                {...form.register('description')}
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  <Check className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    form.reset()
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Included Item
        </Button>
      )}
    </div>
  )
}

// ============================================
// EXCLUDED ITEMS COMPONENT
// ============================================

function ExcludedItemsList({
  packageId,
  items,
}: {
  packageId: string
  items: ExcludedItem[]
}) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(packageExcludedItemBaseSchema),
    defaultValues: {
      title: '',
      description: '',
      icon: '',
      order_index: items.length,
    },
  })

  const editForm = useForm({
    resolver: zodResolver(packageExcludedItemBaseSchema),
  })

  async function onAdd(data: PackageExcludedItemInput) {
    const result = await createPackageExcludedItem({
      ...data,
      package_id: packageId,
    })

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Item added successfully')
    form.reset({
      title: '',
      description: '',
      icon: '',
      order_index: items.length + 1,
    })
    setIsAdding(false)
    router.refresh()
  }

  async function onUpdate(itemId: string, data: PackageExcludedItemInput) {
    const result = await updatePackageExcludedItem({
      ...data,
      id: itemId,
      package_id: packageId,
    })

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Item updated successfully')
    setEditingId(null)
    router.refresh()
  }

  async function onDelete(itemId: string) {
    setDeletingId(itemId)
    const result = await deletePackageExcludedItem(itemId, packageId)

    if (result?.error) {
      toast.error(result.error)
      setDeletingId(null)
      return
    }

    toast.success('Item deleted successfully')
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* List of items */}
      {items.map((item) => {
        const isEditing = editingId === item.id

        if (isEditing) {
          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <form
                  onSubmit={editForm.handleSubmit((data) => onUpdate(item.id, data))}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      {...editForm.register('icon')}
                      placeholder="❌"
                      className="col-span-2"
                      maxLength={10}
                    />
                    <Input
                      {...editForm.register('title')}
                      placeholder="Title"
                      className="col-span-10"
                      required
                    />
                  </div>
                  <Textarea
                    {...editForm.register('description')}
                    placeholder="Description (optional)"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <span className="text-2xl">{item.icon || '❌'}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(item.id)
                    editForm.reset({
                      title: item.title,
                      description: item.description || '',
                      icon: item.icon || '',
                      order_index: item.order_index,
                    })
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Add new item form */}
      {isAdding ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={form.handleSubmit(onAdd)} className="space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <Input
                  {...form.register('icon')}
                  placeholder="❌"
                  className="col-span-2"
                  maxLength={10}
                />
                <Input
                  {...form.register('title')}
                  placeholder="Title (e.g., International flights)"
                  className="col-span-10"
                  required
                />
              </div>
              <Textarea
                {...form.register('description')}
                placeholder="Description (optional)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  <Check className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    form.reset()
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Excluded Item
        </Button>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PackageIncludesForm({
  packageId,
  includedItems,
  excludedItems,
}: PackageIncludesFormProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Included Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4">What's Included</h3>
        <IncludedItemsList packageId={packageId} items={includedItems} />
      </div>

      {/* Excluded Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4">What's NOT Included</h3>
        <ExcludedItemsList packageId={packageId} items={excludedItems} />
      </div>
    </div>
  )
}
