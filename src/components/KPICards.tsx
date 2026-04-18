import { AlertTriangle, Shield, Skull, Users, TrendingDown } from 'lucide-react'
import type { HechoTransito } from '../types'
import { cn } from '../lib/utils'
import { AnimatedNumber } from './AnimatedNumber'

interface Props {
  data: HechoTransito[]
}

export function KPICards({ data }: Props) {
  const totalIncidentes = data.length
  const totalLesionados = data.reduce((s, d) => s + d.personas_lesionadas, 0)
  const totalFallecidos = data.reduce((s, d) => s + d.personas_fallecidas, 0)
  const alcaldiasAfectadas = new Set(data.map(d => d.alcaldia)).size
  const tasaLetalidad = totalIncidentes > 0 ? (totalFallecidos / totalIncidentes) * 100 : 0

  const kpis = [
    {
      label: 'Total Incidentes',
      numValue: totalIncidentes,
      suffix: '',
      icon: AlertTriangle,
      color: 'text-neon-yellow',
      bgColor: 'bg-neon-yellow/10',
      borderColor: 'border-neon-yellow/30',
      glow: 'hover:shadow-[0_0_20px_rgba(255,225,77,0.15)]',
    },
    {
      label: 'Personas Lesionadas',
      numValue: totalLesionados,
      suffix: '',
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/30',
      glow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]',
    },
    {
      label: 'Personas Fallecidas',
      numValue: totalFallecidos,
      suffix: '',
      icon: Skull,
      color: 'text-neon-red',
      bgColor: 'bg-neon-red/10',
      borderColor: 'border-neon-red/30',
      glow: 'hover:shadow-[0_0_20px_rgba(255,49,49,0.15)]',
    },
    {
      label: 'Alcaldías Afectadas',
      numValue: alcaldiasAfectadas,
      suffix: '',
      icon: Shield,
      color: 'text-neon-cyan',
      bgColor: 'bg-neon-cyan/10',
      borderColor: 'border-neon-cyan/30',
      glow: 'hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]',
    },
    {
      label: 'Tasa de Letalidad',
      numValue: tasaLetalidad,
      suffix: '%',
      icon: TrendingDown,
      color: 'text-neon-red',
      bgColor: 'bg-neon-red/10',
      borderColor: 'border-neon-red/30',
      glow: 'hover:shadow-[0_0_20px_rgba(255,49,49,0.15)]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(
            'rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]',
            'bg-surface-800/80',
            kpi.borderColor,
            kpi.glow
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={cn('p-1.5 rounded-lg', kpi.bgColor)}>
              <kpi.icon className={cn('w-4 h-4', kpi.color)} />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-tight">{kpi.label}</span>
          </div>
          <p className={cn('text-3xl font-extrabold tabular-nums', kpi.color)}>
            <AnimatedNumber
              value={Math.round(kpi.numValue * 10) / 10}
              format={kpi.suffix === '%' ? (n) => `${(n / 10).toFixed(1)}%` : undefined}
            />
            {kpi.suffix === '' ? '' : ''}
          </p>
        </div>
      ))}
    </div>
  )
}
