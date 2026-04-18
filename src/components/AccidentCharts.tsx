import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts'
import { Clock, Calendar, Layers } from 'lucide-react'
import type { HechoTransito } from '../types'
import { calcularFrecuenciaPorHora, calcularFrecuenciaPorDia } from '../lib/utils'

interface Props {
  data: HechoTransito[]
}

const COLORS_TIPO = ['#ff3131', '#ff8c00', '#ffe14d', '#00f0ff', '#39ff14', '#a855f7']

export function AccidentCharts({ data }: Props) {
  const porHora = calcularFrecuenciaPorHora(data)
  const porDia = calcularFrecuenciaPorDia(data)

  // Por tipo de evento
  const tipoCount: Record<string, number> = {}
  for (const d of data) {
    if (d.tipo_evento) {
      tipoCount[d.tipo_evento] = (tipoCount[d.tipo_evento] || 0) + 1
    }
  }
  const porTipo = Object.entries(tipoCount)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Frecuencia por hora */}
      <div className="lg:col-span-2 rounded-xl border border-surface-500 bg-surface-800/80 p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neon-cyan" />
          Frecuencia de Incidentes por Hora del Día
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={porHora}>
            <defs>
              <linearGradient id="gradHora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="hora" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={2} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: 8, color: '#e2e8f0' }}
              labelStyle={{ color: '#00f0ff' }}
            />
            <Area type="monotone" dataKey="incidentes" stroke="#00f0ff" fill="url(#gradHora)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2">
          * Picos típicos entre 8:00-10:00 AM (hora pico matutina) y 18:00-20:00 PM (hora pico vespertina)
        </p>
      </div>

      {/* Tipo de evento (pie chart) */}
      <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-neon-yellow" />
          Tipo de Incidente
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={porTipo}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {porTipo.map((_, i) => (
                <Cell key={i} fill={COLORS_TIPO[i % COLORS_TIPO.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1 mt-2">
          {porTipo.map((t, i) => (
            <div key={t.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS_TIPO[i % COLORS_TIPO.length] }} />
              <span className="text-gray-400 truncate">{t.name}</span>
              <span className="text-gray-500 ml-auto font-mono">{t.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frecuencia por día */}
      <div className="lg:col-span-3 rounded-xl border border-surface-500 bg-surface-800/80 p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neon-green" />
          Incidentes por Día de la Semana
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={porDia}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
            <XAxis dataKey="dia" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: 8, color: '#e2e8f0' }}
            />
            <Bar dataKey="incidentes" fill="#39ff14" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
