export interface HechoTransito {
  id: number
  fecha: string
  hora: string
  tipo_evento: string
  latitud: number
  longitud: number
  colonia: string
  alcaldia: string
  tipo_interseccion: string
  semaforizada: string
  clasificacion_vialidad: string
  dia: string
  prioridad: string
  personas_fallecidas: number
  personas_lesionadas: number
}

export type TipoFlotilla = 'todas' | 'ride-sharing' | 'reparto' | 'corporativa' | 'transporte-publico'

export interface ZonaRiesgo {
  alcaldia: string
  colonia: string
  incidentes: number
  severidad: number
  riesgo: 'critico' | 'alto' | 'medio' | 'bajo'
}

export interface KPI {
  label: string
  value: string | number
  delta?: number
  icon: string
}
