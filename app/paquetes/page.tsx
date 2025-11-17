import { createClient } from '@/lib/supabase/server'
import PackagesSection from '@/components/packages/packages-section'
import LandingNavbar from '@/components/layout/landing-navbar'

export const metadata = {
  title: 'Nuestros Paquetes | TravelHub',
  description: 'Explorá todos nuestros paquetes de viaje. Encontrá el destino perfecto para tu próxima aventura.',
}

export default async function PaquetesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    userProfile = { ...user, ...profile }
  }

  // Fetch all active packages with itinerary items
  const { data: packages } = await supabase
    .from('travel_packages')
    .select(`
      *,
      package_itinerary_items (
        id,
        title,
        description,
        day_number,
        category,
        show_in_landing
      )
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <LandingNavbar user={userProfile} />

      {/* Packages Grid */}
      <section className="container mx-auto px-4 py-16">
        <PackagesSection packages={packages || []} />
      </section>
    </div>
  )
}
