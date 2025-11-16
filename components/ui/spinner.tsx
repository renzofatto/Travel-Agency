import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function Spinner({ size = 'md', className, text }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

// Componente para páginas completas
export function PageSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="xl" text={text} />
    </div>
  )
}

// Componente para cards/secciones
export function SectionSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner size="lg" text={text} />
    </div>
  )
}

// Componente inline para botones
export function InlineSpinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />
}
