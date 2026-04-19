import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

import rawData from '../../src/data/hechos_transito.json';
import { calcularZonasRiesgo } from '../../src/lib/utils';
import type { HechoTransito } from '../../src/types';

const data = rawData as HechoTransito[];
const { width, height } = Dimensions.get('window');

const CDMX_CENTER = {
  latitude: 19.4326,
  longitude: -99.1332,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

export default function MapScreen() {
  const criticalZones = useMemo(() => {
    // Calculamos zonas críticas y buscamos una coordenada representativa para cada una
    const zones = calcularZonasRiesgo(data).filter(z => z.riesgo === 'critico' || z.riesgo === 'alto');
    
    return zones.map(z => {
      const sample = data.find(d => d.alcaldia === z.alcaldia && d.colonia === z.colonia);
      return {
        ...z,
        latitude: sample?.latitud || 19.4326,
        longitude: sample?.longitud || -99.1332,
      };
    });
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={CDMX_CENTER}
        customMapStyle={mapStyle}
      >
        {criticalZones.map((zone, index) => (
          <React.Fragment key={`${zone.alcaldia}-${zone.colonia}`}>
            <Marker
              coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
              title={zone.colonia}
              description={`${zone.incidentes} incidentes · Riesgo ${zone.riesgo}`}
            >
              <View style={[styles.markerContainer, { borderColor: zone.riesgo === 'critico' ? '#ff3131' : '#ff8c00' }]}>
                <MapPin size={12} color={zone.riesgo === 'critico' ? '#ff3131' : '#ff8c00'} />
              </View>
            </Marker>
            <Circle
              center={{ latitude: zone.latitude, longitude: zone.longitude }}
              radius={800}
              fillColor={zone.riesgo === 'critico' ? 'rgba(255, 49, 49, 0.2)' : 'rgba(255, 140, 0, 0.2)'}
              strokeColor={zone.riesgo === 'critico' ? 'rgba(255, 49, 49, 0.5)' : 'rgba(255, 140, 0, 0.5)'}
              strokeWidth={1}
            />
          </React.Fragment>
        ))}
      </MapView>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda de Riesgo</Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ff3131' }]} />
          <Text style={styles.legendText}>Crítico</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ff8c00' }]} />
          <Text style={styles.legendText}>Alto</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  map: { width, height: height - 120 },
  markerContainer: {
    padding: 4,
    backgroundColor: '#111118',
    borderRadius: 20,
    borderWidth: 2,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(17, 17, 24, 0.9)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23232f',
  },
  legendTitle: { color: '#e2e8f0', fontSize: 10, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#64748b', fontSize: 10, fontWeight: '600' },
});

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "feature": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "feature": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "feature": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "feature": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "feature": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "feature": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "feature": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "feature": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "feature": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "feature": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "feature": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "feature": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "feature": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "feature": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "feature": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];
