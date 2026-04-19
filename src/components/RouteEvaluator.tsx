import { useState, useMemo } from 'react'
import { Navigation, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { HechoTransito, ZonaRiesgo } from '../types'
import { calcularRiesgoRuta, cn } from '../lib/utils'

interface Props {
  data: HechoTransito[]
  zonasRiesgo: ZonaRiesgo[]
}

export function RouteEvaluator({ data, zonasRiesgo }: Props) {
  const [origen, setOrigen] = useState({ alcaldia: '', colonia: '' })
  const [destino, setDestino] = useState({ alcaldia: '', colonia: '' })
  const [showResult, setShowResult] = useState(false)

  const locations = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    data.forEach(d => {
      if (!map[d.alcaldia]) map[d.alcaldia] = new Set()
      map[d.alcaldia].add(d.colonia)
    })
    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v).sort()])
    )
  }, [data])

  const alcaldias = useMemo(() => Object.keys(locations).sort(), [locations])

  const resultado = useMemo(() => {
    if (!origen.colonia || !destino.colonia) return null
    return calcularRiesgoRuta(origen, destino, zonasRiesgo)
  }, [origen, destino, zonasRiesgo])

  const NIIVELES_CONFIG = {
    critico: { color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/50', icon: AlertTriangle },
    alto: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50', icon: AlertTriangle },
    medio: { color: 'text-neon-yellow', bg: 'bg-neon-yellow/10', border: 'border-neon-yellow/50', icon: AlertTriangle },
    bajo: { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/50', icon: ShieldCheck },
  }

  return (
    <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-6 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-neon-green" />
        Evaluador de Riesgo por Ruta (Simulado)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" /> Origen
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={origen.alcaldia}
                onChange={(e) => setOrigen({ alcaldia: e.target.value, colonia: '' })}
                className="bg-surface-700 border border-surface-500 rounded p-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="">Alcaldía...</option>
                {alcaldias.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={origen.colonia}
                disabled={!origen.alcaldia}
                onChange={(e) => setOrigen({ ...origen, colonia: e.target.value })}
                className="bg-surface-700 border border-surface-500 rounded p-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50 disabled:opacity-50"
              >
                <option value="">Colonia...</option>
                {origen.alcaldia && locations[origen.alcaldia].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-center py-1">
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-red" /> Destino
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={destino.alcaldia}
                onChange={(e) => setDestino({ alcaldia: e.target.value, colonia: '' })}
                className="bg-surface-700 border border-surface-500 rounded p-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50"
              >
                <option value="">Alcaldía...</option>
                {alcaldias.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={destino.colonia}
                disabled={!destino.alcaldia}
                onChange={(e) => setDestino({ ...destino, colonia: e.target.value })}
                className="bg-surface-700 border border-surface-500 rounded p-2 text-xs text-white focus:outline-none focus:border-neon-cyan/50 disabled:opacity-50"
              >
                <option value="">Colonia...</option>
                {destino.alcaldia && locations[destino.alcaldia].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowResult(true)}
            disabled={!origen.colonia || !destino.colonia}
            className="w-full mt-4 py-3 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/30 rounded-lg text-xs font-bold text-neon-green uppercase tracking-widest hover:from-neon-green/30 hover:to-neon-cyan/30 transition-all disabled:opacity-50"
          >
            Evaluar Ruta
          </button>
        </div>

        <div className="min-h-[240px] flex items-center justify-center border-l border-surface-700 pl-0 md:pl-8">
          {showResult && resultado ? (
            <div className={cn(
              "w-full p-6 rounded-xl border animate-in zoom-in-95 duration-300",
              NIIVELES_CONFIG[resultado.nivel].bg,
              NIIVELES_CONFIG[resultado.nivel].border
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-lg bg-surface-900/50", NIIVELES_CONFIG[resultado.nivel].color)}>
                  {(() => {
                    const Icon = NIIVELES_CONFIG[resultado.nivel].icon
                    return <Icon className="w-6 h-6" />
                  })()}
                </div>
                <div>
                  <h4 className={cn("text-lg font-bold uppercase", NIIVELES_CONFIG[resultado.nivel].color)}>
                    Riesgo {resultado.nivel}
                  </h4>
                  <p className="text-xs text-gray-400">Score de Seguridad: {resultado.score.toFixed(1)}/10</p>
                </div>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed mb-4 italic">
                "{resultado.recomendacion}"
              </p>
              <div className="text-[10px] text-gray-500 border-t border-white/5 pt-4">
                Basado en {data.length.toLocaleString()} registros históricos de incidentes en las colonias {origen.colonia} y {destino.colonia}.
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 opacity-30">
              <Navigation className="w-12 h-12 mx-auto text-gray-500" />
              <p className="text-xs uppercase tracking-widest text-gray-500">Seleccione origen y destino para evaluar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
