import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Activity, Map as MapIcon, Bell, Shield } from 'lucide-react-native';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import MapScreen from './screens/MapScreen';
import AlertsScreen from './screens/AlertsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: '#111118',
            borderBottomWidth: 1,
            borderBottomColor: '#23232f',
          },
          headerTitleStyle: {
            color: '#e2e8f0',
            fontSize: 18,
            fontWeight: '800',
          },
          headerLeft: () => (
            <Shield size={24} color="#00f0ff" style={{ marginLeft: 16 }} />
          ),
          tabBarStyle: {
            backgroundColor: '#111118',
            borderTopColor: '#23232f',
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#00f0ff',
          tabBarInactiveTintColor: '#64748b',
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Dashboard') return <Activity size={size} color={color} />;
            if (route.name === 'Mapa') return <MapIcon size={size} color={color} />;
            if (route.name === 'Alertas') return <Bell size={size} color={color} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Scorecard' }} />
        <Tab.Screen name="Mapa" component={MapScreen} options={{ title: 'Zonas Críticas' }} />
        <Tab.Screen name="Alertas" component={AlertsScreen} options={{ title: 'Configuración' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
