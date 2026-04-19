import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { AlertTriangle, Users, Clock, TrendingUp, Globe } from 'lucide-react-native';
import { LineChart } from 'react-native-gifted-charts';

// Importando desde la carpeta compartida
import rawData from '../../shared/data/hechos_transito.json';
import { filtrarPorFlotilla, calcularZonasRiesgo, calcularFrecuenciaPorHora } from '../../shared/lib/utils';
import { useTranslation } from '../../shared/lib/i18n';
import type { TipoFlotilla, HechoTransito } from '../../shared/types';

const data = rawData as HechoTransito[];
const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  bg: '#0a0a0f',
  card: '#111118',
  text: '#e2e8f0',
  subtext: '#64748b',
  border: '#23232f',
  neonCyan: '#00f0ff',
  neonGreen: '#39ff14',
  neonRed: '#ff3131',
  neonYellow: '#ffe14d',
};

export default function DashboardScreen() {
  const [flotilla, setFlotilla] = useState<TipoFlotilla>('todas');
  const { t, lang, setLang } = useTranslation();

  const filteredData = useMemo(() => filtrarPorFlotilla(data, flotilla), [flotilla]);
  const zones = useMemo(() => calcularZonasRiesgo(filteredData).slice(0, 5), [filteredData]);
  const hourlyData = useMemo(() => calcularFrecuenciaPorHora(filteredData), [filteredData]);

  const totalIncidentes = filteredData.length;
  const totalLesionados = filteredData.reduce((sum, d) => sum + d.personas_lesionadas, 0);

  // Formatear datos para Gifted Charts
  const chartData = hourlyData.map((d, index) => ({
    value: d.incidentes,
    label: index % 6 === 0 ? d.hora.split(':')[0] : '',
    dataPointText: d.incidentes > 5 ? String(d.incidentes) : undefined,
    labelTextStyle: { color: COLORS.subtext, fontSize: 10 },
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Selector de Idioma */}
        <View style={styles.headerAction}>
          <TouchableOpacity 
            onPress={() => setLang(lang === 'es' ? 'en' : 'es')}
            style={styles.langToggle}
          >
            <Globe size={14} color={COLORS.neonCyan} />
            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de Flotilla */}
        <Text style={styles.sectionTitle}>{t('fleetType')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {(['todas', 'ride-sharing', 'reparto', 'transporte-publico', 'corporativa'] as TipoFlotilla[]).map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFlotilla(f)}
              style={[
                styles.filterPill, 
                { 
                  backgroundColor: flotilla === f ? COLORS.neonCyan + '20' : COLORS.card, 
                  borderColor: flotilla === f ? COLORS.neonCyan : COLORS.border 
                }
              ]}
            >
              <Text style={[styles.filterText, { color: flotilla === f ? COLORS.neonCyan : COLORS.text }]}>
                {t(f as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <AlertTriangle size={18} color={COLORS.neonYellow} />
            <Text style={styles.kpiValue}>{totalIncidentes.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>{t('incidents')}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Users size={18} color={COLORS.neonGreen} />
            <Text style={styles.kpiValue}>{totalLesionados.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>{t('injured')}</Text>
          </View>
        </View>

        {/* Gráfica Interactiva */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Clock size={16} color={COLORS.neonCyan} />
            <Text style={styles.cardTitle}>{t('hourlyTrend')}</Text>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              height={180}
              width={screenWidth - 80}
              initialSpacing={10}
              spacing={(screenWidth - 100) / 24}
              color={COLORS.neonCyan}
              thickness={3}
              hideRules
              yAxisColor={COLORS.border}
              xAxisColor={COLORS.border}
              yAxisTextStyle={{ color: COLORS.subtext, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: COLORS.subtext, fontSize: 10 }}
              noOfSections={4}
              areaChart
              startFillColor={COLORS.neonCyan}
              startOpacity={0.2}
              endFillColor={COLORS.neonCyan}
              endOpacity={0.01}
              curved
              animateOnDataChange
              animationDuration={1000}
              pointerConfig={{
                pointerStripColor: COLORS.neonCyan,
                pointerStripWidth: 2,
                pointerColor: COLORS.neonCyan,
                radius: 6,
                pointerLabelComponent: (items: any) => (
                  <View style={styles.pointerLabel}>
                    <Text style={styles.pointerText}>{items[0].value} {t('incidents').toLowerCase()}</Text>
                  </View>
                ),
              }}
            />
          </View>
        </View>

        {/* Zonas Críticas */}
        <View style={styles.listCard}>
          <View style={styles.cardHeader}>
            <TrendingUp size={16} color={COLORS.neonRed} />
            <Text style={styles.cardTitle}>{t('criticalZones')}</Text>
          </View>
          {zones.map((z, i) => (
            <View key={`${z.alcaldia}-${z.colonia}`} style={[styles.listItem, i === zones.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{z.colonia}</Text>
                <Text style={styles.itemSubtitle}>{z.alcaldia}</Text>
              </View>
              <View style={styles.itemValueContainer}>
                <Text style={[styles.itemRisk, z.riesgo === 'critico' ? { color: COLORS.neonRed } : { color: '#ff8c00' }]}>
                  {z.riesgo.toUpperCase()}
                </Text>
                <Text style={styles.itemCount}>{z.incidentes} evt</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },
  headerAction: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  langText: { fontSize: 10, fontWeight: '800', color: COLORS.text },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: COLORS.subtext, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  selectorScroll: { marginBottom: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  filterText: { fontSize: 12, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: 'center' },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#fff', marginVertical: 4 },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: COLORS.subtext, textTransform: 'uppercase' },
  chartCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  chartWrapper: { marginLeft: -20 },
  pointerLabel: { backgroundColor: '#1e293b', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neonCyan, left: -40, top: -40 },
  pointerText: { color: COLORS.neonCyan, fontSize: 10, fontWeight: 'bold' },
  listCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  itemSubtitle: { fontSize: 11, color: COLORS.subtext },
  itemValueContainer: { alignItems: 'flex-end', marginLeft: 12 },
  itemRisk: { fontSize: 10, fontWeight: '900', marginBottom: 2 },
  itemCount: { fontSize: 10, color: COLORS.subtext, fontWeight: '600' },
});
