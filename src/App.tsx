import { useState, useMemo, useEffect } from 'react'
import { Activity, Shield, Search, X, Sun, Moon, Calendar, Filter } from 'lucide-react'
import type { TipoFlotilla } from './types'
import { filtrarPorFlotilla, calcularZonasRiesgo, calcularFrecuenciaPorHora, cn } from './lib/utils'
import { FleetSelector } from './components/FleetSelector'
import { KPICards } from './components/KPICards'
import { RiskMapPanel } from './components/RiskMapPanel'
import { HeatmapChart } from './components/HeatmapChart'
import { AccidentCharts } from './components/AccidentCharts'
import { FinancialImpact } from './components/FinancialImpact'
import { SmartInsights } from './components/SmartInsights'
import { InteractiveMap } from './components/InteractiveMap'
import { ExportCenter } from './components/ExportCenter'
import { RouteEvaluator } from './components/RouteEvaluator'
import rawData from './data/hechos_transito.json'
import type { HechoTransito } from './types'

const data = rawData as HechoTransito[]

export default function App() {
  const [flotilla, setFlotilla] = useState<TipoFlotilla>('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlcaldia, setSelectedAlcaldia] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [severity, setSeverity] = useState<'todas' | 'BAJA' | 'MEDIA' | 'ALTA' | 'FATAL'>('todas')
  
  const [compareMode, setCompareMode] = useState(false)
  const [flotillaB, setFlotillaB] = useState<TipoFlotilla>('todas')
  const [selectedAlcaldiaB, setSelectedAlcaldiaB] = useState<string | null>(null)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'light' | 'dark'
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  const filteredData = useMemo(() => {
    let result = filtrarPorFlotilla(data, flotilla)
    if (selectedAlcaldia) result = result.filter(d => d.alcaldia === selectedAlcaldia)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d => 
        (d.colonia?.toLowerCase().includes(q) || false) || 
        (d.alcaldia?.toLowerCase().includes(q) || false)
      )
    }
    if (startDate) result = result.filter(d => d.fecha >= startDate)
    if (endDate) result = result.filter(d => d.fecha <= endDate)
    if (severity !== 'todas') {
      if (severity === 'FATAL') result = result.filter(d => d.personas_fallecidas > 0)
      else result = result.filter(d => d.prioridad === severity)
    }
    return result
  }, [flotilla, searchQuery, selectedAlcaldia, startDate, endDate, severity])

  const filteredDataB = useMemo(() => {
    if (!compareMode) return []
    let result = filtrarPorFlotilla(data, flotillaB)
    if (selectedAlcaldiaB) result = result.filter(d => d.alcaldia === selectedAlcaldiaB)
    if (startDate) result = result.filter(d => d.fecha >= startDate)
    if (endDate) result = result.filter(d => d.fecha <= endDate)
    if (severity !== 'todas') {
      if (severity === 'FATAL') result = result.filter(d => d.personas_fallecidas > 0)
      else result = result.filter(d => d.prioridad === severity)
    }
    return result
  }, [compareMode, flotillaB, selectedAlcaldiaB, startDate, endDate, severity])

  const zonasRiesgo = useMemo(() => calcularZonasRiesgo(filteredData), [filteredData])
  const porHora = useMemo(() => calcularFrecuenciaPorHora(filteredData), [filteredData])

  return (
    <div className="min-h-screen bg-surface-900 transition-colors duration-300">
      <header className="border-b border-surface-500 bg-surface-800/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-green/10 border border-neon-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-neon-cyan" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-bold text-white tracking-tight truncate">
                  Scorecard Flotillas CDMX
                </h1>
                <p className="hidden xs:block text-[10px] md:text-xs text-gray-500">
                  Riesgo vial · SSC 2024
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto md:order-last">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-green/5 border border-neon-green/20">
                <Activity className="w-3.5 h-3.5 text-neon-green animate-pulse" />
                <span className="text-neon-green font-medium text-[10px] md:text-xs">
                  {filteredData.length.toLocaleString('es-MX')}
                </span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-surface-700/50 border border-surface-500 text-gray-400 hover:text-neon-cyan transition-colors"
                title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <ExportCenter 
                data={filteredData} 
                filters={{ flotilla, alcaldia: selectedAlcaldia, startDate, endDate }} 
              />
            </div>

            <div className="relative w-full md:flex-1 md:max-w-md order-last md:order-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar colonia o alcaldía..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-700/50 border border-surface-500 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="bg-surface-800/50 border border-surface-500 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex justify-between">
                <span>{compareMode ? 'Flotilla A' : 'Tipo de Flotilla'}</span>
                <button 
                  onClick={() => setCompareMode(!compareMode)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold border transition-colors",
                    compareMode ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan" : "bg-surface-700 border-surface-500 text-gray-500 hover:text-gray-300"
                  )}
                >
                  {compareMode ? 'MODO COMPARACIÓN ACTIVO' : 'COMPARAR FLOTILLAS'}
                </button>
              </label>
              <FleetSelector selected={flotilla} onChange={setFlotilla} />
            </div>

            {compareMode && (
              <div className="flex-1 min-w-[200px] animate-in slide-in-from-left-2">
                <label className="text-[10px] font-semibold text-neon-cyan uppercase tracking-wider mb-2 block">
                  Flotilla B
                </label>
                <FleetSelector selected={flotillaB} onChange={setFlotillaB} />
              </div>
            )}
            
            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Rango de Fechas
              </label>
              <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-surface-700 border border-surface-500 rounded px-2 py-1 text-xs text-white" />
                <span className="text-gray-500 text-xs">-</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-surface-700 border border-surface-500 rounded px-2 py-1 text-xs text-white" />
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Filter className="w-3 h-3" /> Severidad
              </label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="bg-surface-700 border border-surface-500 rounded px-3 py-1.5 text-xs text-white w-full sm:w-32">
                <option value="todas">Todas</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="FATAL">💀 Fatal</option>
              </select>
            </div>

            {(selectedAlcaldia || searchQuery || startDate || endDate || severity !== 'todas') && (
              <button 
                onClick={() => { setSelectedAlcaldia(null); setSearchQuery(''); setStartDate(''); setEndDate(''); setSeverity('todas'); setSelectedAlcaldiaB(null); }}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase py-2"
              >
                Limpiar Todo
              </button>
            )}
          </div>

          {compareMode && (
            <div className="pt-3 border-t border-surface-600 flex flex-wrap gap-4 items-end animate-in fade-in">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Alcaldía A</label>
                <select value={selectedAlcaldia || ''} onChange={(e) => setSelectedAlcaldia(e.target.value || null)} className="bg-surface-700 border border-surface-500 rounded px-3 py-1.5 text-xs text-white w-full">
                  <option value="">Todas las Alcaldías</option>
                  {Array.from(new Set(data.map(d => d.alcaldia))).sort().map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-semibold text-neon-cyan uppercase tracking-wider mb-2 block">Alcaldía B</label>
                <select value={selectedAlcaldiaB || ''} onChange={(e) => setSelectedAlcaldiaB(e.target.value || null)} className="bg-surface-700 border border-neon-cyan/30 rounded px-3 py-1.5 text-xs text-white w-full">
                  <option value="">Todas las Alcaldías</option>
                  {Array.from(new Set(data.map(d => d.alcaldia))).sort().map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          )}
        </section>

        {compareMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95">
            <div className="space-y-6">
              <div className="p-3 bg-surface-800/40 rounded-lg border border-surface-500 text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Grupo de Datos A</span>
                <h4 className="text-sm font-bold text-white">{flotilla.toUpperCase()} {selectedAlcaldia ? `· ${selectedAlcaldia}` : ''}</h4>
              </div>
              <KPICards data={filteredData} />
              <InteractiveMap data={filteredData} />
            </div>
            <div className="space-y-6">
              <div className="p-3 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20 text-center">
                <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Grupo de Datos B</span>
                <h4 className="text-sm font-bold text-white">{flotillaB.toUpperCase()} {selectedAlcaldiaB ? `· ${selectedAlcaldiaB}` : ''}</h4>
              </div>
              <KPICards data={filteredDataB} />
              <InteractiveMap data={filteredDataB} />
            </div>
          </div>
        ) : (
          <>
            <KPICards data={filteredData} />
            <div className="grid grid-cols-1 gap-6">
              <InteractiveMap data={filteredData} />
            </div>
            <RouteEvaluator data={data} zonasRiesgo={zonasRiesgo} />
            <RiskMapPanel zonas={zonasRiesgo} selectedAlcaldia={selectedAlcaldia} onSelectAlcaldia={setSelectedAlcaldia} />
            <HeatmapChart data={filteredData} />
            <AccidentCharts data={filteredData} />
            <FinancialImpact data={filteredData} flotilla={flotilla} zonasRiesgo={zonasRiesgo} />
            <SmartInsights data={filteredData} flotilla={flotilla} zonas={zonasRiesgo} porHora={porHora} />
          </>
        )}

        <footer className="text-center py-6 border-t border-surface-600 text-xs text-gray-600">
          <p>Datos obtenidos del portal <a href="https://datos.cdmx.gob.mx" target="_blank" rel="noopener noreferrer" className="text-neon-cyan/60 hover:text-neon-cyan">datos.cdmx.gob.mx</a> — Dataset "Hechos de Tránsito SSC 2024"</p>
          <p className="mt-1">Hackathon CDMX 2024 · Scorecard de Flotillas</p>
        </footer>
      </main>
    </div>
  )
}
