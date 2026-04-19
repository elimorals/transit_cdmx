import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { HechoTransito } from '../types'

// Optional: Register fonts if needed
// Font.register({ family: 'Inter', src: '...' })

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#00f0ff',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    padding: 5,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  kpiLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 8,
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  }
})

interface Props {
  data: HechoTransito[]
  filters: {
    flotilla: string
    alcaldia: string | null
    startDate: string
    endDate: string
  }
}

export function ReportDocument({ data, filters }: Props) {
  const totalIncidentes = data.length
  const totalLesionados = data.reduce((sum, d) => sum + d.personas_lesionadas, 0)
  const totalFallecidos = data.reduce((sum, d) => sum + d.personas_fallecidas, 0)
  
  // Top 5 alcaldías
  const porAlcaldia: Record<string, number> = {}
  data.forEach(d => {
    porAlcaldia[d.alcaldia] = (porAlcaldia[d.alcaldia] || 0) + 1
  })
  const topAlcaldias = Object.entries(porAlcaldia)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reporte de Seguridad Vial</Text>
            <Text style={styles.subtitle}>CDMX · Flotillas · Scorecard 2024</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.subtitle}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Filtros</Text>
          <Text style={{ fontSize: 9, color: '#475569' }}>
            Flotilla: {filters.flotilla} | Alcaldía: {filters.alcaldia || 'Todas'} | 
            Periodo: {filters.startDate || 'Inicio'} al {filters.endDate || 'Hoy'}
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Incidentes</Text>
            <Text style={styles.kpiValue}>{totalIncidentes.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Lesionados</Text>
            <Text style={styles.kpiValue}>{totalLesionados.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Fallecidos</Text>
            <Text style={styles.kpiValue}>{totalFallecidos.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 5 Alcaldías con Mayor Incidencia</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
              <View style={[styles.tableCol, { width: '70%' }]}><Text style={styles.tableCell}>Alcaldía</Text></View>
              <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>Incidentes</Text></View>
            </View>
            {topAlcaldias.map(([alcaldia, count]) => (
              <View key={alcaldia} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '70%' }]}><Text style={styles.tableCell}>{alcaldia}</Text></View>
                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{count}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análisis de Riesgo</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#334155' }}>
            Este reporte muestra la distribución de incidentes viales según los parámetros seleccionados. 
            Se observa una mayor concentración de eventos en zonas de alta densidad vehicular. 
            Se recomienda extremar precauciones en las alcaldías listadas arriba, especialmente en 
            horarios de mayor afluencia.
          </Text>
        </View>

        <Text style={styles.footer}>
          Generado por Scorecard Flotillas CDMX · Datos de datos.cdmx.gob.mx
        </Text>
      </Page>
    </Document>
  )
}
