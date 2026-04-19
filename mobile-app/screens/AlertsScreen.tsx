import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Bell, MapPin, ShieldAlert, Navigation, TestTube } from 'lucide-react-native';

import rawData from '../../src/data/hechos_transito.json';
import { calcularZonasRiesgo } from '../../src/lib/utils';
import { useTranslation } from '../../src/lib/i18n';
import type { HechoTransito } from '../../src/types';

const data = rawData as HechoTransito[];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COLORS = {
  bg: '#0a0a0f',
  card: '#111118',
  text: '#e2e8f0',
  subtext: '#64748b',
  border: '#23232f',
  neonCyan: '#00f0ff',
  neonGreen: '#39ff14',
  neonRed: '#ff3131',
};

export default function AlertsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useTranslation();

  const criticalZones = useMemo(() => {
    const zones = calcularZonasRiesgo(data).filter(z => z.riesgo === 'critico');
    return zones.map(z => {
      const sample = data.find(d => d.alcaldia === z.alcaldia && d.colonia === z.colonia);
      return {
        ...z,
        latitude: sample?.latitud || 0,
        longitude: sample?.longitud || 0,
      };
    });
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    if (isEnabled) {
      const start = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setIsEnabled(false);
          return;
        }

        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        if (notificationStatus !== 'granted') {
          Alert.alert('Aviso', 'No podremos enviarte alertas sin permisos de notificación.');
        }

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 50 },
          (loc) => {
            setLocation(loc);
            checkProximity(loc.coords.latitude, loc.coords.longitude);
          }
        );
      };
      start();
    } else {
      setLocation(null);
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isEnabled]);

  const checkProximity = (userLat: number, userLon: number) => {
    const ALERTA_RADIO_KM = 0.8; // Alerta a 800m

    criticalZones.forEach(zone => {
      const distance = getDistance(userLat, userLon, zone.latitude, zone.longitude);
      if (distance < ALERTA_RADIO_KM) {
        sendAlert(zone.colonia, zone.riesgo);
      }
    });
  };

  const simulateProximity = () => {
    if (criticalZones.length > 0) {
      const randomZone = criticalZones[Math.floor(Math.random() * criticalZones.length)];
      sendAlert(randomZone.colonia, randomZone.riesgo);
      Alert.alert("Simulación", `Alerta enviada para: ${randomZone.colonia}`);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sendAlert = async (colonia: string, riesgo: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ " + t('riskLevel') + ": CRÍTICO",
        body: `Te aproximas a ${colonia}. Extrema precauciones por alta incidencia vial.`,
        data: { colonia, riesgo },
      },
      trigger: null,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Bell size={32} color={isEnabled ? COLORS.neonGreen : COLORS.subtext} />
        </View>
        <Text style={styles.title}>{t('proximityAlerts')}</Text>
        <Text style={styles.description}>
          Recibe notificaciones automáticas cuando te aproximes a colonias con alta incidencia de accidentes.
        </Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>{t('monitoringActive')}</Text>
            <Text style={styles.settingSublabel}>GPS Foreground</Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.neonGreen + '40' }}
            thumbColor={isEnabled ? COLORS.neonGreen : COLORS.subtext}
          />
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <MapPin size={20} color={COLORS.neonCyan} />
          <Text style={styles.infoValue}>{criticalZones.length}</Text>
          <Text style={styles.infoLabel}>{t('criticalZones')}</Text>
        </View>
        <View style={styles.infoCard}>
          <Navigation size={20} color={COLORS.neonGreen} />
          <Text style={styles.infoValue}>0.8</Text>
          <Text style={styles.infoLabel}>Radio (km)</Text>
        </View>
      </View>

      {isEnabled && (
        <View style={styles.statusBanner}>
          <ShieldAlert size={16} color={COLORS.neonGreen} />
          <Text style={styles.statusText}>{t('realTimeScanning')}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.simulateButton}
        onPress={simulateProximity}
      >
        <TestTube size={18} color={COLORS.text} />
        <Text style={styles.simulateButtonText}>Probar Alerta (Simulación)</Text>
      </TouchableOpacity>

      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  iconContainer: { padding: 24, borderRadius: 40, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  description: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', lineHeight: 20 },
  settingsCard: { backgroundColor: COLORS.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  settingSublabel: { fontSize: 11, color: COLORS.subtext },
  infoGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  infoCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  infoValue: { fontSize: 18, fontWeight: '800', color: '#fff', marginVertical: 8 },
  infoLabel: { fontSize: 10, color: COLORS.subtext, textTransform: 'uppercase', fontWeight: '700' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', backgroundColor: COLORS.neonGreen + '10', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.neonGreen + '30', marginBottom: 20 },
  statusText: { fontSize: 11, color: COLORS.neonGreen, fontWeight: '600' },
  simulateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  simulateButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  errorText: { color: COLORS.neonRed, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
