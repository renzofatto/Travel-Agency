import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  // Check if user is admin
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const isAdmin = true

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar user={{ ...user, ...profile }} />

      <div className="flex flex-1">
        <Sidebar isAdmin={isAdmin} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
