import { useState, useMemo, useEffect } from 'react'
import { Activity, Database, Shield, Search, X, Sun, Moon } from 'lucide-react'
import type { TipoFlotilla } from './types'
import { filtrarPorFlotilla, calcularZonasRiesgo, calcularFrecuenciaPorHora } from './lib/utils'
import { FleetSelector } from './components/FleetSelector'
import { KPICards } from './components/KPICards'
import { RiskMapPanel } from './components/RiskMapPanel'
import { HeatmapChart } from './components/HeatmapChart'
import { AccidentCharts } from './components/AccidentCharts'
import { FinancialImpact } from './components/FinancialImpact'
import { SmartInsights } from './components/SmartInsights'
import rawData from './data/hechos_transito.json'
import type { HechoTransito } from './types'

const data = rawData as HechoTransito[]

export default function App() {
  const [flotilla, setFlotilla] = useState<TipoFlotilla>('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlcaldia, setSelectedAlcaldia] = useState<string | null>(null)
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
    if (selectedAlcaldia) {
      result = result.filter(d => d.alcaldia === selectedAlcaldia)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(d => 
        (d.colonia?.toLowerCase().includes(q) || false) || 
        (d.alcaldia?.toLowerCase().includes(q) || false)
      )
    }
    return result
  }, [flotilla, searchQuery, selectedAlcaldia])

  const zonasRiesgo = useMemo(() => calcularZonasRiesgo(filteredData), [filteredData])
  const porHora = useMemo(() => calcularFrecuenciaPorHora(filteredData), [filteredData])

  return (
    <div className="min-h-screen bg-surface-900 transition-colors duration-300">
      {/* Header */}
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
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Tipo de Flotilla
            </label>
            <FleetSelector selected={flotilla} onChange={setFlotilla} />
          </div>
          {(selectedAlcaldia || searchQuery) && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <span className="text-xs text-gray-500">Filtros activos:</span>
              {selectedAlcaldia && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 text-[10px] text-neon-cyan font-bold uppercase">
                  {selectedAlcaldia}
                  <button onClick={() => setSelectedAlcaldia(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-yellow/10 border border-neon-yellow/20 text-[10px] text-neon-yellow font-bold uppercase">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </section>

        <KPICards data={filteredData} />
        <RiskMapPanel zonas={zonasRiesgo} selectedAlcaldia={selectedAlcaldia} onSelectAlcaldia={setSelectedAlcaldia} />
        <HeatmapChart data={filteredData} />
        <AccidentCharts data={filteredData} />
        <FinancialImpact data={filteredData} flotilla={flotilla} zonasRiesgo={zonasRiesgo} />
        <SmartInsights data={filteredData} flotilla={flotilla} zonas={zonasRiesgo} porHora={porHora} />

        <footer className="text-center py-6 border-t border-surface-600 text-xs text-gray-600">
          <p>Datos obtenidos del portal <a href="https://datos.cdmx.gob.mx" target="_blank" rel="noopener noreferrer" className="text-neon-cyan/60 hover:text-neon-cyan">datos.cdmx.gob.mx</a> — Dataset "Hechos de Tránsito SSC 2024"</p>
          <p className="mt-1">Hackathon CDMX 2024 · Scorecard de Flotillas</p>
        </footer>
      </main>
    </div>
  )
}
