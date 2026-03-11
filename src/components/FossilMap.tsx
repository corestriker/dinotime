import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Taxon } from '../types'

interface Props {
  taxon: Taxon
}

const GROUP_COLOR: Record<string, string> = {
  'Dinosauria': '#38bdf8',  // sky
  'Reptilia':   '#a78bfa',  // violet
}

export default function FossilMap({ taxon }: Props) {
  if (taxon.locations.length === 0) return (
    <div className="w-full h-48 rounded flex items-center justify-center text-white/30 text-sm italic"
      style={{ background: '#1a1625' }}>
      Keine Fundorte bekannt
    </div>
  )

  const color = GROUP_COLOR[taxon.group] ?? '#38bdf8'

  // Mittelpunkt der Fundorte berechnen
  const avgLat = taxon.locations.reduce((s, l) => s + l[0], 0) / taxon.locations.length
  const avgLng = taxon.locations.reduce((s, l) => s + l[1], 0) / taxon.locations.length

  return (
    <div className="w-full h-48 rounded overflow-hidden">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {taxon.locations.map((loc, i) => (
          <CircleMarker
            key={i}
            center={loc}
            radius={6}
            pathOptions={{
              color:       color,
              fillColor:   color,
              fillOpacity: 0.8,
              weight:      1,
            }}
          >
            <Popup>{taxon.name}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}