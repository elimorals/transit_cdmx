# Scorecard de Flotillas CDMX

Dashboard analítico que evalúa el riesgo de accidentes de tránsito por zonas de la Ciudad de México, diseñado para optimizar la logística de empresas con flotillas vehiculares.

## Problema

Las empresas con flotillas vehiculares en CDMX (ride-sharing, reparto de última milla, transporte corporativo) enfrentan costos elevados por accidentes viales: reparaciones, inactividad de unidades y primas de seguro. Sin una herramienta de análisis geoespacial, las rutas se trazan sin considerar las zonas de mayor riesgo.

## Solución

**Scorecard de Flotillas** cruza datos oficiales de movilidad e incidentes de tránsito para ofrecer a gestores de flotillas:

- **KPIs en tiempo real**: Total de incidentes, lesionados, fallecidos, alcaldías afectadas y tasa de letalidad.
- **Filtro por tipo de flotilla**: Ride-sharing, reparto, corporativa o transporte público — cada uno con perfiles de riesgo diferentes.
- **Mapa de riesgo por zonas**: Top 5 alcaldías y Top 10 colonias con mayor índice de percances.
- **Análisis temporal**: Frecuencia de accidentes por hora del día y día de la semana, identificando los picos de riesgo.
- **Impacto financiero**: Estimación del ahorro en costos operativos al evitar zonas rojas, con modelo de severidad × costo base.

## Dataset

Los datos provienen del portal de **Datos Abiertos de la Ciudad de México**:

- **Fuente**: [datos.cdmx.gob.mx](https://datos.cdmx.gob.mx)
- **Dataset**: "SSC Hechos de Tránsito 2024"
- **Registros**: 4,500 incidentes (enero-diciembre 2024)
- **Licencia**: CC-BY-4.0
- **API**: CKAN Datastore — `https://datos.cdmx.gob.mx/api/3/action/datastore_search?resource_id=27b88c58-e741-4526-bfd0-5200fe272f8d`

Los campos incluyen: fecha, hora, tipo de evento (choque, atropellado, derrapado, volcadura), ubicación (alcaldía, colonia, coordenadas), prioridad, personas lesionadas y fallecidas.

## Tech Stack

| Tecnología | Uso |
|---|---|
| [Vite](https://vite.dev) | Build tool |
| [React 19](https://react.dev) + TypeScript | UI framework |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilos (dark mode, neón) |
| [Recharts](https://recharts.org) | Gráficas (área, barras, pie) |
| [Lucide React](https://lucide.dev) | Iconografía |

## Inicialización

```bash
# Clonar el repositorio
git clone <repo-url>
cd scorecard-flotillas-cdmx

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build
```

La aplicación estará disponible en `http://localhost:5173`.

## Modelo Financiero

El cálculo de ahorro usa la siguiente fórmula simplificada:

```
Costo sin optimizar = Incidentes × Costo Base ($15,000 MXN) × Peso Flotilla
                    + Incidentes × Inactividad ($3,500/día) × (Severidad / 10)

Ahorro = Costo sin optimizar × 35% × (Incidentes en zonas rojas / Total incidentes)
```

Los pesos por tipo de flotilla reflejan la exposición al riesgo:
- Transporte público: 1.7x (mayor exposición)
- Reparto: 1.5x
- Ride-sharing: 1.3x
- Corporativa: 0.8x

## Licencia

MIT — Datos bajo CC-BY-4.0 (Gobierno de la Ciudad de México).
