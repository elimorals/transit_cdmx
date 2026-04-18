import { Brain, AlertTriangle, Clock, Route, ShieldCheck, TrendingUp } from 'lucide-react'
import type { HechoTransito, TipoFlotilla, ZonaRiesgo } from '../types'
import { cn } from '../lib/utils'

interface Props {
  data: HechoTransito[]
  flotilla: TipoFlotilla
  zonas: ZonaRiesgo[]
  porHora: { hora: string; incidentes: number }[]
}

interface Insight {
  icon: typeof Brain
  color: string
  title: string
  body: string
  priority: 'critica' | 'alta' | 'media'
}

export function SmartInsights({ data, flotilla, zonas, porHora }: Props) {
  const insights: Insight[] = []

  // 1. Zonas más peligrosas
  const topZonas = zonas.filter(z => z.riesgo === 'critico' || z.riesgo === 'alto').slice(0, 3)
  if (topZonas.length > 0) {
    insights.push({
      icon: AlertTriangle,
      color: 'text-neon-red',
      title: 'Zonas Rojas Identificadas',
      body: `Evitar rutas por ${topZonas.map(z => z.colonia).join(', ')} (${topZonas[0].alcaldia}). Concentran ${topZonas.reduce((s, z) => s + z.incidentes, 0)} incidentes con severidad ${topZonas[0].riesgo}.`,
      priority: 'critica',
    })
  }

  // 2. Horarios pico
  const sorted = [...porHora].sort((a, b) => b.incidentes - a.incidentes)
  const peakHours = sorted.slice(0, 3)
  if (peakHours.length > 0) {
    insights.push({
      icon: Clock,
      color: 'text-neon-yellow',
      title: 'Ventanas Horarias de Mayor Riesgo',
      body: `Los horarios ${peakHours.map(h => h.hora).join(', ')} concentran el mayor volumen de incidentes. Programar despachos fuera de estos picos puede reducir la exposición hasta un 25%.`,
      priority: 'alta',
    })
  }

  // 3. Horarios seguros
  const safeHours = sorted.slice(-5).reverse()
  insights.push({
    icon: ShieldCheck,
    color: 'text-neon-green',
    title: 'Ventanas Seguras para Operación',
    body: `Los horarios con menor incidencia son ${safeHours.map(h => h.hora).join(', ')}. Ideal para rutas de alto valor o traslado de mercancía sensible.`,
    priority: 'media',
  })

  // 4. Tipo de intersección más peligrosa
  const intCount: Record<string, number> = {}
  for (const d of data) {
    if (d.tipo_interseccion) intCount[d.tipo_interseccion] = (intCount[d.tipo_interseccion] || 0) + 1
  }
  const topInt = Object.entries(intCount).sort(([, a], [, b]) => b - a)[0]
  if (topInt) {
    insights.push({
      icon: Route,
      color: 'text-neon-cyan',
      title: 'Infraestructura Vial de Riesgo',
      body: `Las intersecciones tipo "${topInt[0]}" acumulan ${topInt[1]} incidentes (${((topInt[1] / data.length) * 100).toFixed(0)}% del total). Priorizar rutas con intersecciones semaforizadas reduce el riesgo significativamente.`,
      priority: 'alta',
    })
  }

  // 5. Intersecciones sin semáforo
  const sinSemaforo = data.filter(d => d.semaforizada === 'NO').length
  const pctSinSemaforo = ((sinSemaforo / data.length) * 100).toFixed(0)
  insights.push({
    icon: TrendingUp,
    color: 'text-orange-400',
    title: 'Factor de Riesgo: Sin Semáforo',
    body: `El ${pctSinSemaforo}% de los incidentes ocurren en intersecciones sin semáforo (${sinSemaforo} de ${data.length}). Las rutas que priorizan vías semaforizadas reducen la probabilidad de colisión.`,
    priority: 'alta',
  })

  const priorityOrder = { critica: 0, alta: 1, media: 2 }

  return (
    <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        Recomendaciones Inteligentes
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Análisis automatizado para flotilla: <span className="text-neon-cyan font-medium">{flotilla}</span> — {data.length} incidentes analizados
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
          .map((insight, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border bg-surface-700/30 p-4 transition-all hover:bg-surface-700/50',
                insight.priority === 'critica' ? 'border-neon-red/30' :
                insight.priority === 'alta' ? 'border-orange-400/20' : 'border-surface-500'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', `${insight.color.replace('text-', 'bg-')}/10`)}>
                  <insight.icon className={cn('w-4 h-4', insight.color)} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-200">{insight.title}</h4>
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase',
                      insight.priority === 'critica' ? 'bg-neon-red/15 text-neon-red' :
                      insight.priority === 'alta' ? 'bg-orange-400/15 text-orange-400' :
                      'bg-neon-green/15 text-neon-green'
                    )}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{insight.body}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
