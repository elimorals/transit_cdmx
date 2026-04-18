import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shield, AlertTriangle, Users, Skull, Activity, Search } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

// Simulación de datos y lógica (deberías importar tus utils aquí)
import rawData from './data/hechos_transito.json';

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [flotilla, setFlotilla] = useState('todas');
  const [theme, setTheme] = useState('dark');

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#0a0a0f' : '#f8fafc',
    card: isDark ? '#111118' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#0f172a',
    border: isDark ? '#23232f' : '#e2e8f0',
    neonCyan: '#00f0ff',
    neonGreen: '#39ff14',
    neonRed: '#ff3131',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header Móvil */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Shield size={24} color={colors.neonCyan} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Scorecard Móvil</Text>
          </View>
          <TouchableOpacity onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Activity size={20} color={colors.neonGreen} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de Flotilla - Scroll Horizontal */}
        <Text style={styles.sectionTitle}>Tipo de Flotilla</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {['todas', 'ride-sharing', 'reparto', 'transporte'].map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFlotilla(f)}
              style={[
                styles.filterPill, 
                { backgroundColor: flotilla === f ? colors.neonCyan + '20' : colors.card, borderColor: flotilla === f ? colors.neonCyan : colors.border }
              ]}
            >
              <Text style={[styles.filterText, { color: flotilla === f ? colors.neonCyan : colors.text }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* KPIs Estilo Mobile */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <AlertTriangle size={16} color="#ffe14d" />
            <Text style={styles.kpiValue}>1,240</Text>
            <Text style={styles.kpiLabel}>Incidentes</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Users size={16} color="#39ff14" />
            <Text style={styles.kpiValue}>452</Text>
            <Text style={styles.kpiLabel}>Lesionados</Text>
          </View>
        </View>

        {/* Gráfico de Tendencia */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Tendencia por Hora</Text>
          <LineChart
            data={{
              labels: ["00", "06", "12", "18", "23"],
              datasets: [{ data: [20, 45, 28, 80, 43] }]
            }}
            width={screenWidth - 48}
            height={180}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 240, 255, ${opacity})`,
              labelColor: (opacity = 1) => colors.text,
              propsForDots: { r: "4", strokeWidth: "2", stroke: colors.neonCyan }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Top Alcaldías */}
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Zonas Críticas</Text>
          {['IZTAPALAPA', 'CUAUHTEMOC', 'GUSTAVO A. MADERO'].map((a, i) => (
            <View key={a} style={styles.listItem}>
              <Text style={{color: colors.text, fontSize: 14}}>{i+1}. {a}</Text>
              <Text style={{color: colors.neonRed, fontWeight: 'bold'}}>ALTO</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 },
  selectorScroll: { marginBottom: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterText: { fontSize: 13, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '800', marginVertical: 4, color: '#fff' },
  kpiLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase' },
  chartCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  listCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#23232f' }
});
