import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Taxon } from '../types'

interface Props {
  taxa:        Taxon[]
  onSelect:    (t: Taxon) => void
  highlighted: string | null
  onReady:     () => void
}

const GROUP_COLOR: Record<string, string> = {
  'Dinosauria': '#38bdf8',
  'Reptilia':   '#a78bfa',
}

// Erstellt eine schnelle Lookup-Map: location → Taxon
interface LocPoint {
  lat:   number
  lng:   number
  taxon: Taxon
}

export default function MapView({ taxa, onSelect, highlighted, onReady }: Props) {
  const dinos    = taxa.filter(t => t.group === 'Dinosauria')
  const reptiles = taxa.filter(t => t.group === 'Reptilia')

  // Alle Fundorte als flache Liste
  const points = useMemo<LocPoint[]>(() => {
    const result: LocPoint[] = []
    for (const t of taxa) {
      for (const loc of t.locations) {
        result.push({ lat: loc[0], lng: loc[1], taxon: t })
      }
    }
    return result
  }, [taxa])

  return (
    <div className="flex-1 flex min-h-0">

      {/* Linke Liste – Dinosauria */}
      <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-white/5 py-2">
        <p className="text-[10px] uppercase tracking-widest text-sky-400/60 px-3 mb-2">
          Dinosauria <span className="text-white/20">({dinos.length})</span>
        </p>
        {dinos.map(t => (
          <button
            key={t.name}
            onClick={() => onSelect(t)}
            className={`w-full text-left px-3 py-0.5 text-xs transition-colors truncate
              ${t.name === highlighted
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Karte in der Mitte */}
      <div className="flex-1 relative">
        <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            whenReady={onReady}
            >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {points.map((p, i) => (
            <CircleMarker
    key={`${i}-${highlighted}`}  // ← highlighted in key einbauen
    center={[p.lat, p.lng]}
    radius={p.taxon.name === highlighted ? 8 : 4}  // ← highlighted größer
    pathOptions={{
            color:       p.taxon.name === highlighted ? '#ef4444' : GROUP_COLOR[p.taxon.group],
            fillColor:   p.taxon.name === highlighted ? '#ef4444' : GROUP_COLOR[p.taxon.group],
            fillOpacity: highlighted
                ? p.taxon.name === highlighted ? 1 : 0.05
                : 0.5,
            weight: highlighted
                ? p.taxon.name === highlighted ? 2 : 0
                : 0.5,
            opacity: highlighted
                ? p.taxon.name === highlighted ? 1 : 0.05
                : 0.5,
            }}
              eventHandlers={{
                click: () => onSelect(p.taxon),
              }}
            >
              <Tooltip sticky>
                <span className="text-xs italic">{p.taxon.name}</span>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Rechte Liste – Reptilia */}
      <div className="w-56 flex-shrink-0 overflow-y-auto border-l border-white/5 py-2">
        <p className="text-[10px] uppercase tracking-widest text-violet-400/60 px-3 mb-2 text-right">
          Reptilia <span className="text-white/20">({reptiles.length})</span>
        </p>
        {reptiles.map(t => (
          <button
            key={t.name}
            onClick={() => onSelect(t)}
            className={`w-full text-right px-3 py-0.5 text-xs transition-colors truncate
              ${t.name === highlighted
                ? 'text-violet-300 bg-violet-500/10'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
          >
            {t.name}
          </button>
        ))}
      </div>

    </div>
  )
}