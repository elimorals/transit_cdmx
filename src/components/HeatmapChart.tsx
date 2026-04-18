import { Flame } from 'lucide-react'
import type { HechoTransito } from '../types'
import { cn } from '../lib/utils'

interface Props {
  data: HechoTransito[]
}

const DIAS_ORDEN = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const DIAS_LABEL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HORAS = Array.from({ length: 24 }, (_, i) => i)

function getColor(value: number, max: number): string {
  if (max === 0) return 'bg-surface-700'
  const ratio = value / max
  if (ratio === 0) return 'bg-surface-700'
  if (ratio < 0.15) return 'bg-emerald-900/60'
  if (ratio < 0.3) return 'bg-emerald-700/60'
  if (ratio < 0.45) return 'bg-yellow-700/60'
  if (ratio < 0.6) return 'bg-orange-600/60'
  if (ratio < 0.75) return 'bg-red-600/70'
  return 'bg-red-500/90'
}

function getGlow(value: number, max: number): string {
  if (max === 0) return ''
  const ratio = value / max
  if (ratio >= 0.75) return 'shadow-[0_0_8px_rgba(255,49,49,0.5)]'
  if (ratio >= 0.6) return 'shadow-[0_0_4px_rgba(255,100,50,0.3)]'
  return ''
}

export function HeatmapChart({ data }: Props) {
  // Construir matriz hora × día
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  let max = 0

  for (const d of data) {
    if (!d.hora || !d.dia) continue
    const h = parseInt(d.hora.split(':')[0], 10)
    const dia = d.dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const dIdx = DIAS_ORDEN.indexOf(dia)
    if (dIdx >= 0 && !isNaN(h)) {
      matrix[dIdx][h]++
      if (matrix[dIdx][h] > max) max = matrix[dIdx][h]
    }
  }

  return (
    <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Flame className="w-4 h-4 text-neon-red" />
        Mapa de Calor — Incidentes por Hora y Día
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header de horas */}
          <div className="flex items-center gap-0.5 mb-1 ml-10">
            {HORAS.map(h => (
              <div key={h} className="flex-1 text-center text-[9px] text-gray-500 font-mono">
                {h % 3 === 0 ? `${String(h).padStart(2, '0')}` : ''}
              </div>
            ))}
          </div>

          {/* Filas por día */}
          {DIAS_ORDEN.map((dia, dIdx) => (
            <div key={dia} className="flex items-center gap-0.5 mb-0.5">
              <div className="w-10 text-right text-xs text-gray-400 pr-2 shrink-0 font-medium">
                {DIAS_LABEL[dIdx]}
              </div>
              {HORAS.map(h => (
                <div
                  key={h}
                  className={cn(
                    'flex-1 aspect-[1.8] rounded-sm transition-all cursor-default',
                    getColor(matrix[dIdx][h], max),
                    getGlow(matrix[dIdx][h], max)
                  )}
                  title={`${DIAS_LABEL[dIdx]} ${String(h).padStart(2, '0')}:00 — ${matrix[dIdx][h]} incidentes`}
                />
              ))}
            </div>
          ))}

          {/* Leyenda */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-gray-500 mr-1">Menor</span>
            {['bg-surface-700', 'bg-emerald-900/60', 'bg-emerald-700/60', 'bg-yellow-700/60', 'bg-orange-600/60', 'bg-red-600/70', 'bg-red-500/90'].map((c, i) => (
              <div key={i} className={cn('w-4 h-3 rounded-sm', c)} />
            ))}
            <span className="text-[10px] text-gray-500 ml-1">Mayor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
