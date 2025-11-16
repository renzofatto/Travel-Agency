import { PageSpinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PageSpinner text="Cargando TravelHub..." />
    </div>
  )
}
