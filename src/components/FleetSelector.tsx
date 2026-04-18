import { Car, Bike, Briefcase, Bus, LayoutGrid } from 'lucide-react'
import type { TipoFlotilla } from '../types'
import { cn } from '../lib/utils'

interface Props {
  selected: TipoFlotilla
  onChange: (f: TipoFlotilla) => void
}

const FLOTILLAS: { id: TipoFlotilla; label: string; icon: typeof Car; desc: string }[] = [
  { id: 'todas', label: 'Todas', icon: LayoutGrid, desc: 'Vista general' },
  { id: 'ride-sharing', label: 'Ride-Sharing', icon: Car, desc: 'Uber, DiDi, Cabify' },
  { id: 'reparto', label: 'Reparto', icon: Bike, desc: 'Última milla' },
  { id: 'corporativa', label: 'Corporativa', icon: Briefcase, desc: 'Ejecutivos' },
  { id: 'transporte-publico', label: 'Transporte', icon: Bus, desc: 'Público / rutas' },
]

export function FleetSelector({ selected, onChange }: Props) {
  return (
    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 no-scrollbar">
      {FLOTILLAS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap shrink-0',
            selected === f.id
              ? 'bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]'
              : 'bg-surface-800 border-surface-500 text-gray-400 hover:border-gray-500 hover:text-gray-300'
          )}
        >
          <f.icon className="w-4 h-4" />
          <span>{f.label}</span>
          <span className="hidden lg:inline text-xs opacity-60">· {f.desc}</span>
        </button>
      ))}
    </div>
  )
}
