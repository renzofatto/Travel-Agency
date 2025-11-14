'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateGroupButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/dashboard/groups/new')}
      size="lg"
    >
      <Plus className="w-4 h-4 mr-2" />
      Create Group
    </Button>
  )
}
