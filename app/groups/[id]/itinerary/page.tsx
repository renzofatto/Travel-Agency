import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ItineraryPageClient from '@/components/itinerary/itinerary-page-client'

export default async function GroupItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has access to this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Fetch itinerary items
  const { data: items } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('group_id', id)
    .order('date', { ascending: true })
    .order('order_index', { ascending: true })

  return <ItineraryPageClient groupId={id} items={items || []} />
}
