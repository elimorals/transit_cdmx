import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { MapPin, AlertCircle } from 'lucide-react'
import type { HechoTransito } from '../types'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet markers in Vite/React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface Props {
  data: HechoTransito[]
}

const CDMX_CENTER: [number, number] = [19.4326, -99.1332]

export function InteractiveMap({ data }: Props) {
  return (
    <div className="rounded-xl border border-surface-500 bg-surface-800/80 p-5 h-[500px] relative overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-neon-cyan" />
        Mapa Geográfico de Incidentes
      </h3>
      
      <div className="h-[400px] rounded-lg overflow-hidden border border-surface-600">
        <MapContainer 
          center={CDMX_CENTER} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {data.map((item) => (
              <Marker 
                key={item.id} 
                position={[item.latitud, item.longitud]}
              >
                <Popup>
                  <div className="p-2 text-surface-900">
                    <div className="font-bold border-b border-gray-200 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      {item.tipo_evento}
                    </div>
                    <p className="text-xs font-medium uppercase text-gray-600">
                      {item.alcaldia} · {item.colonia}
                    </p>
                    <div className="mt-2 text-[10px] space-y-0.5">
                      <p>📅 {item.fecha} {item.hora}</p>
                      <p>🚑 Lesionados: {item.personas_lesionadas}</p>
                      <p>💀 Fallecidos: {item.personas_fallecidas}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      
      <div className="absolute bottom-8 right-8 bg-surface-900/80 backdrop-blur-md p-2 rounded-md border border-surface-500 text-[10px] text-gray-400 pointer-events-none">
        Mostrando {data.length.toLocaleString()} puntos geolocalizados
      </div>
    </div>
  )
}
