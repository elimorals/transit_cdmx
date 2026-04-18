import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { HechoTransito, TipoFlotilla, ZonaRiesgo } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VEHICULOS_POR_FLOTILLA: Record<TipoFlotilla, string[]> = {
  'todas': [],
  'ride-sharing': ['CHOQUE', 'DERRAPADO', 'ATROPELLADO'],
  'reparto': ['CHOQUE', 'DERRAPADO', 'VOLCADURA'],
  'corporativa': ['CHOQUE', 'DERRAPADO'],
  'transporte-publico': ['CHOQUE', 'ATROPELLADO', 'CAIDA DE PASAJERO', 'VOLCADURA'],
}

// Peso de riesgo por tipo de flotilla (mayor exposición = mayor peso)
const PESO_FLOTILLA: Record<TipoFlotilla, number> = {
  'todas': 1,
  'ride-sharing': 1.3,
  'reparto': 1.5,
  'corporativa': 0.8,
  'transporte-publico': 1.7,
}

export function filtrarPorFlotilla(data: HechoTransito[], flotilla: TipoFlotilla): HechoTransito[] {
  if (flotilla === 'todas') return data
  const tipos = VEHICULOS_POR_FLOTILLA[flotilla]
  return data.filter(d => tipos.includes(d.tipo_evento))
}

export function calcularZonasRiesgo(data: HechoTransito[]): ZonaRiesgo[] {
  const zonas: Record<string, { incidentes: number; lesionados: number; fallecidos: number; colonia: string; alcaldia: string }> = {}

  for (const d of data) {
    const key = `${d.alcaldia}|${d.colonia}`
    if (!zonas[key]) {
      zonas[key] = { incidentes: 0, lesionados: 0, fallecidos: 0, colonia: d.colonia, alcaldia: d.alcaldia }
    }
    zonas[key].incidentes++
    zonas[key].lesionados += d.personas_lesionadas
    zonas[key].fallecidos += d.personas_fallecidas
  }

  return Object.values(zonas)
    .map(z => {
      const severidad = Math.min(10, Math.round((z.incidentes * 2 + z.lesionados * 3 + z.fallecidos * 10) / z.incidentes))
      return {
        alcaldia: z.alcaldia,
        colonia: z.colonia,
        incidentes: z.incidentes,
        severidad,
        riesgo: severidad >= 8 ? 'critico' as const : severidad >= 6 ? 'alto' as const : severidad >= 4 ? 'medio' as const : 'bajo' as const,
      }
    })
    .sort((a, b) => b.incidentes - a.incidentes)
}

export function calcularFrecuenciaPorHora(data: HechoTransito[]): { hora: string; incidentes: number }[] {
  const horas: Record<number, number> = {}
  for (let i = 0; i < 24; i++) horas[i] = 0

  for (const d of data) {
    if (!d.hora) continue
    const h = parseInt(d.hora.split(':')[0], 10)
    if (!isNaN(h)) horas[h]++
  }

  return Object.entries(horas).map(([h, count]) => ({
    hora: `${h.padStart(2, '0')}:00`,
    incidentes: count,
  }))
}

export function calcularFrecuenciaPorDia(data: HechoTransito[]): { dia: string; incidentes: number }[] {
  const orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
  const dias: Record<string, number> = {}
  for (const d of orden) dias[d] = 0

  for (const d of data) {
    if (!d.dia) continue
    const dia = d.dia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (dias[dia] !== undefined) dias[dia]++
  }

  return orden.map(d => ({ dia: d.charAt(0).toUpperCase() + d.slice(1, 3), incidentes: dias[d] }))
}

export function calcularAhorro(data: HechoTransito[], flotilla: TipoFlotilla, zonasRiesgo: ZonaRiesgo[]): {
  costoSinOptimizar: number
  costoOptimizado: number
  ahorro: number
  porcentaje: number
} {
  const COSTO_BASE_REPARACION = 15000 // MXN promedio
  const COSTO_INACTIVIDAD_DIA = 3500 // MXN por día sin operar
  const peso = PESO_FLOTILLA[flotilla]

  const zonasAltas = zonasRiesgo.filter(z => z.riesgo === 'critico' || z.riesgo === 'alto')
  const incidentesZonasAltas = zonasAltas.reduce((sum, z) => sum + z.incidentes, 0)
  const totalIncidentes = data.length

  const severidadPromedio = zonasRiesgo.length > 0
    ? zonasRiesgo.reduce((sum, z) => sum + z.severidad, 0) / zonasRiesgo.length
    : 5

  const costoSinOptimizar = Math.round(totalIncidentes * COSTO_BASE_REPARACION * peso + totalIncidentes * COSTO_INACTIVIDAD_DIA * (severidadPromedio / 10))
  const reduccion = 0.35 // Reducción estimada al evitar zonas rojas
  const costoOptimizado = Math.round(costoSinOptimizar * (1 - reduccion * (incidentesZonasAltas / Math.max(totalIncidentes, 1))))
  const ahorro = costoSinOptimizar - costoOptimizado

  return {
    costoSinOptimizar,
    costoOptimizado,
    ahorro,
    porcentaje: Math.round((ahorro / costoSinOptimizar) * 100),
  }
}

export function formatMXN(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}
