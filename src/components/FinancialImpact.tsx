import { DollarSign, TrendingUp, ArrowDown, Calculator } from 'lucide-react'
import type { HechoTransito, TipoFlotilla, ZonaRiesgo } from '../types'
import { calcularAhorro, formatMXN, cn } from '../lib/utils'

interface Props {
  data: HechoTransito[]
  flotilla: TipoFlotilla
  zonasRiesgo: ZonaRiesgo[]
}

export function FinancialImpact({ data, flotilla, zonasRiesgo }: Props) {
  const { costoSinOptimizar, costoOptimizado, ahorro, porcentaje } = calcularAhorro(data, flotilla, zonasRiesgo)

  const metricas = [
    {
      label: 'Costo Estimado sin Optimizar',
      value: formatMXN(costoSinOptimizar),
      desc: 'Reparaciones + inactividad',
      icon: DollarSign,
      color: 'text-neon-red',
      borderColor: 'border-neon-red/30',
    },
    {
      label: 'Costo con Rutas Optimizadas',
      value: formatMXN(costoOptimizado),
      desc: 'Evitando zonas de alto riesgo',
      icon: TrendingUp,
      color: 'text-neon-green',
      borderColor: 'border-neon-green/30',
    },
    {
      label: 'Ahorro Estimado',
      value: formatMXN(ahorro),
      desc: `${porcentaje}% de reducción en costos`,
      icon: ArrowDown,
      color: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/30',
    },
  ]

  return (
    <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-neon-green" />
        Impacto Financiero Estimado
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        Modelo: Severidad × Costo Base (MXN $15,000) + Inactividad ($3,500/día) × Peso de flotilla ({flotilla})
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricas.map((m) => (
          <div key={m.label} className={cn('rounded-lg border bg-surface-700/50 p-4', m.borderColor)}>
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={cn('w-5 h-5', m.color)} />
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
            <p className={cn('text-xl font-bold font-mono', m.color)}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Barra visual de ahorro */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Costo Actual</span>
          <span className="text-neon-green font-semibold">-{porcentaje}% con optimización</span>
        </div>
        <div className="h-4 bg-neon-red/20 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-neon-green/80 to-neon-cyan/80 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(57,255,20,0.3)]"
            style={{ width: `${100 - porcentaje}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white drop-shadow-lg">
              {formatMXN(ahorro)} de ahorro potencial
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
