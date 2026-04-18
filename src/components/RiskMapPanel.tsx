import { MapPin, AlertOctagon, AlertTriangle, Info } from 'lucide-react'
import type { ZonaRiesgo } from '../types'
import { cn } from '../lib/utils'

interface Props {
  zonas: ZonaRiesgo[]
  selectedAlcaldia: string | null
  onSelectAlcaldia: (alcaldia: string | null) => void
}

const RIESGO_CONFIG = {
  critico: { color: 'text-neon-red', bg: 'bg-neon-red', barBg: 'bg-neon-red/80', icon: AlertOctagon, label: 'Critico' },
  alto: { color: 'text-orange-400', bg: 'bg-orange-400', barBg: 'bg-orange-400/80', icon: AlertTriangle, label: 'Alto' },
  medio: { color: 'text-neon-yellow', bg: 'bg-neon-yellow', barBg: 'bg-neon-yellow/80', icon: Info, label: 'Medio' },
  bajo: { color: 'text-neon-green', bg: 'bg-neon-green', barBg: 'bg-neon-green/80', icon: MapPin, label: 'Bajo' },
}

export function RiskMapPanel({ zonas, selectedAlcaldia, onSelectAlcaldia }: Props) {
  const top10 = zonas.slice(0, 10)
  const maxIncidentes = top10.length > 0 ? top10[0].incidentes : 1

  // Agrupar por alcaldía para resumen
  const porAlcaldia: Record<string, number> = {}
  for (const z of zonas) {
    porAlcaldia[z.alcaldia] = (porAlcaldia[z.alcaldia] || 0) + z.incidentes
  }
  const topAlcaldias = Object.entries(porAlcaldia)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  const maxAlcaldia = topAlcaldias.length > 0 ? topAlcaldias[0][1] : 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Alcaldías */}
      <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neon-red" />
            Top 5 Alcaldías con Mayor Riesgo
          </h3>
          {selectedAlcaldia && (
            <button
              onClick={() => onSelectAlcaldia(null)}
              className="text-[10px] text-neon-cyan hover:underline uppercase font-bold"
            >
              Limpiar Filtro
            </button>
          )}
        </div>
        <div className="space-y-3">
          {topAlcaldias.map(([alcaldia, count], i) => {
            const pct = (count / maxAlcaldia) * 100
            const isTop = i < 2
            const isSelected = selectedAlcaldia === alcaldia
            return (
              <div
                key={alcaldia}
                onClick={() => onSelectAlcaldia(isSelected ? null : alcaldia)}
                className={cn(
                  'cursor-pointer group p-1.5 -m-1.5 rounded-lg transition-colors',
                  isSelected ? 'bg-white/5' : 'hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm font-medium transition-colors', isSelected ? 'text-neon-cyan' : 'text-gray-200')}>
                    <span className={cn('inline-block w-5 text-xs font-bold', isTop ? 'text-neon-red' : 'text-gray-500')}>
                      #{i + 1}
                    </span>
                    {alcaldia}
                  </span>
                  <span className={cn('text-xs font-mono', isTop ? 'text-neon-red' : 'text-gray-400')}>
                    {count} incidentes
                  </span>
                </div>
                <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isSelected ? 'bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.4)]' :
                      isTop ? 'bg-neon-red/80' : 'bg-orange-400/60'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Colonias */}
      <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-orange-400" />
          Top 10 Colonias de Mayor Riesgo
        </h3>
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {top10.map((zona, i) => {
            const cfg = RIESGO_CONFIG[zona.riesgo]
            const pct = (zona.incidentes / maxIncidentes) * 100
            return (
              <div key={`${zona.alcaldia}-${zona.colonia}-${i}`} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <cfg.icon className={cn('w-3.5 h-3.5 shrink-0', cfg.color)} />
                    <span className="text-sm text-gray-200 truncate">{zona.colonia}</span>
                    <span className="text-[10px] text-gray-500">{zona.alcaldia}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold', cfg.color, `${cfg.bg}/15`)}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono w-8 text-right">{zona.incidentes}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', cfg.barBg)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
