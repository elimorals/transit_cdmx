import { useState, useEffect } from 'react';

const translations = {
  es: {
    dashboard: 'Dashboard',
    map: 'Mapa',
    alerts: 'Alertas',
    fleetType: 'Tipo de Flotilla',
    incidents: 'Incidentes',
    injured: 'Lesionados',
    hourlyTrend: 'Tendencia por Hora',
    criticalZones: 'Zonas Críticas',
    proximityAlerts: 'Alertas de Proximidad',
    monitoringActive: 'Monitorización Activa',
    realTimeScanning: 'Escaneando alrededores...',
    riskLevel: 'Nivel de Riesgo',
    recommendation: 'Recomendación',
    settings: 'Configuración',
    all: 'Todas',
    'ride-sharing': 'Viaje Compartido',
    reparto: 'Reparto',
    'transporte-publico': 'Transporte Público',
    corporativa: 'Corporativa',
  },
  en: {
    dashboard: 'Dashboard',
    map: 'Map',
    alerts: 'Alerts',
    fleetType: 'Fleet Type',
    incidents: 'Incidents',
    injured: 'Injured',
    hourlyTrend: 'Hourly Trend',
    criticalZones: 'Critical Zones',
    proximityAlerts: 'Proximity Alerts',
    monitoringActive: 'Active Monitoring',
    realTimeScanning: 'Scanning surroundings...',
    riskLevel: 'Risk Level',
    recommendation: 'Recommendation',
    settings: 'Settings',
    all: 'All',
    'ride-sharing': 'Ride Sharing',
    reparto: 'Delivery',
    'transporte-publico': 'Public Transport',
    corporativa: 'Corporate',
  }
};

type Language = 'es' | 'en';

export function useTranslation() {
  const [lang, setLang] = useState<Language>('es');

  const t = (key: keyof typeof translations['es']) => {
    return translations[lang][key] || key;
  };

  return { t, lang, setLang };
}
