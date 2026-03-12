import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, Popup } from 'react-leaflet'
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
  const activeTaxon = taxa.find(t => t.name === highlighted) ?? null

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

  function FlyTo({ taxon }: { taxon: Taxon | null }) {
    const map = useMap()
    useEffect(() => {
      if (taxon && taxon.locations.length > 0) {
        map.flyTo([taxon.locations[0][0], taxon.locations[0][1]], 4, { duration: 1 })
      }
    }, [taxon, map])
    return null
  }

  function OpenPopup({ position }: { position: [number, number] }) {
    const map = useMap()
    useEffect(() => {
      map.eachLayer(layer => {
        if ((layer as any).getLatLng) {
          const latlng = (layer as any).getLatLng()
          if (
            Math.abs(latlng.lat - position[0]) < 0.001 &&
            Math.abs(latlng.lng - position[1]) < 0.001
          ) {
            (layer as any).openPopup?.()
          }
        }
      })
    }, [map, position])
    return null
  }

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
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapContainer
            style={{ height: '100%', width: '100%', background: '#0d0b14' }}
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            zoomControl={true}
            whenReady={onReady}
            >
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          />
          <FlyTo taxon={activeTaxon} />

          {/* Standalone Popup für highlighted Art */}
            {activeTaxon && activeTaxon.locations.length > 0 && (
              <Popup
                position={[activeTaxon.locations[0][0], activeTaxon.locations[0][1]]}
                closeButton={false}
                className="dino-popup"
                autoPan={false}
              >
                <div style={{ background: '#1a1625', borderRadius: '8px', overflow: 'hidden', width: '200px' }}>
                  {activeTaxon.imageUrl && (
                    <div style={{ background: activeTaxon.isPhylopic ? '#2a2040' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                      <img
                        src={activeTaxon.imageUrl}
                        alt={activeTaxon.name}
                        style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '10px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>
                      {activeTaxon.group}
                    </p>
                    <p style={{ color: 'white', fontStyle: 'italic', fontWeight: 600, fontSize: '13px', margin: '0 0 4px' }}>
                      {activeTaxon.name}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 8px' }}>
                      {activeTaxon.start} – {activeTaxon.end} Ma
                    </p>
                    {activeTaxon.wiki && (
                      
                      <a  href={`https://en.wikipedia.org/wiki/${activeTaxon.wiki}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', fontSize: '11px', textDecoration: 'none' }}
                      >
                        Wikipedia →
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            )}
            {points.map((p, i) => {
            const isHighlighted = p.taxon.name === highlighted

            return (
              <CircleMarker
                key={`${i}-${highlighted}`}
                center={[p.lat, p.lng]}
                radius={isHighlighted ? 8 : 4}
                pathOptions={{
                  color:       isHighlighted ? '#ef4444' : GROUP_COLOR[p.taxon.group],
                  fillColor:   isHighlighted ? '#ef4444' : GROUP_COLOR[p.taxon.group],
                  fillOpacity: highlighted ? (isHighlighted ? 1 : 0.05) : 0.5,
                  weight:      highlighted ? (isHighlighted ? 2 : 0) : 0.5,
                  opacity:     highlighted ? (isHighlighted ? 1 : 0.05) : 0.5,
                }}
                eventHandlers={{
                  click: () => onSelect(p.taxon),
                }}
              >
                <Tooltip sticky>
                  <span style={{ fontSize: '12px', fontStyle: 'italic' }}>{p.taxon.name}</span>
                </Tooltip>
              </CircleMarker>
            )
          })}
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