import { useMemo, useState } from 'react'
import './App.css'
import RangeSlider from './components/RangeSlider'
import { useTaxa } from './hooks/useTaxa'
import TaxonList from './components/TaxonList'
import type { RangeValue, Taxon } from './types'
import SearchBar from './components/SearchBar'
import MapView from './components/MapView'
import LegalModal from './components/LegalModal'
import TaxonPanel from './components/TaxomPanel'

const MAX_MA = 323

export type SortMode = 'alpha' | 'oldest' | 'newest'

export default function App() {
  const [view, setView] = useState<'list' | 'map'>('list')
  const [mapReady, setMapReady] = useState(false)
  const [switching, setSwitching] = useState(false)
  const { taxa, loading, error } = useTaxa()
  const [range, setRange] = useState<RangeValue>({ from: MAX_MA, to: 0 })
  const [sort, setSort] = useState<SortMode>('oldest')
  const [selected, setSelected] = useState<Taxon | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [legalPage, setLegalPage] = useState<'impressum' | 'datenschutz' | 'quellen' | null>(null)

  const filtered = useMemo(() => {
  const f = taxa.filter(t => t.start >= range.to && t.end <= range.from)

  const sorted = [...f].sort((a, b) => {
      if (sort === 'alpha')  return a.name.localeCompare(b.name)
      if (sort === 'oldest') return b.start - a.start
      return a.start - b.start
    })

    // Highlighted Element an den Anfang
    if (highlighted) {
      const idx = sorted.findIndex(t => t.name === highlighted)
      if (idx > 0) {
        const [item] = sorted.splice(idx, 1)
        sorted.unshift(item)
      }
    }

    return sorted
  }, [taxa, range, sort, highlighted])

  function handleSearch(taxon: Taxon) {
  setRange({ from: taxon.start, to: taxon.end })
  setHighlighted(taxon.name)
  // setTimeout entfernen – highlighted bleibt bis Panel geschlossen wird
  }

  function handleSelect(taxon: Taxon) {
    setHighlighted(taxon.name)
    if (view === 'list') {
      setSelected(taxon)
    }
  }
  
  if (loading) return (
    <div className="bg-neutral-950 text-yellow-400 min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl animate-bounce">🦕</div>
      <p className="text-lg font-semibold tracking-widest uppercase">Loading fossils…</p>
    </div>
  )

  if (error) return (
    <div className="bg-neutral-950 text-red-400 min-h-screen flex items-center justify-center">
      <p>Error: {error}</p>
    </div>
  )


   return (
  <div
    className="text-neutral-200 h-screen flex flex-col overflow-hidden"
    style={{ background: '#0d0b14' }}
  >
    {/* Header */}
    <header className="shrink-0 px-6 py-3 border-b border-white/5 flex items-center justify-between" style={{ background: '#110e1a' }}>
      <h1 className="font-display text-xl text-sky-400 tracking-wide">DinoTime</h1>

      <div className="flex items-center gap-1 bg-white/5 rounded p-1">
      <button
          onClick={() => setView('list')}
          className={`px-3 py-1 rounded text-xs transition-all ${
            view === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
          }`}
        >
          List
        </button>
        <button
          onClick={() => {
            setSwitching(true)
            setMapReady(false)
            // Kurz warten damit React den Ladescreen rendern kann
            setTimeout(() => {
              setView('map')
              setSwitching(false)
            }, 50)
          }}
          className={`px-3 py-1 rounded text-xs transition-all ${
            view === 'map' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
          }`}
        >
          Map
        </button>
      </div>

      <span className="text-xs text-white/50 tabular-nums">{filtered.length} species</span>
    </header>

    {/* Slider */}
    <div className="shrink-0">
      <RangeSlider value={range} onChange={setRange} />
    </div>

    {/* Suche + Sortierung */}
    <div className="shrink-0 px-6 py-2 border-b border-white/5 flex items-center gap-4 flex-wrap" style={{ background: '#110e1a' }}>
      <SearchBar taxa={taxa} onSelect={handleSearch} />
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-[10px] uppercase tracking-widest text-white/40">Sort</span>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="text-xs px-2 py-1 rounded border border-white/10 outline-none cursor-pointer text-white/60"
          style={{ background: '#1a1625' }}
        >
          <option value="oldest">Oldest first</option>
          <option value="newest">Newest first</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>
    </div>

    {/* Ansicht */}
     <div className="flex-1 overflow-hidden">
      {switching ? (
        <div className="h-full flex flex-col items-center justify-center gap-3">
          <div className="text-4xl animate-bounce">🌍</div>
          <p className="text-xs uppercase tracking-widest text-white/30">Switching view…</p>
        </div>
      ) : view === 'list' ? (
        <TaxonList taxa={filtered} onSelect={setSelected} highlighted={highlighted} />
      ) : (
        <div className="h-full flex relative">
          {!mapReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3" style={{ background: '#0d0b14' }}>
              <div className="text-4xl animate-bounce">🌍</div>
              <p className="text-xs uppercase tracking-widest text-white/30">Loading Map…</p>
            </div>
          )}
          <MapView
            taxa={filtered}
            onSelect={handleSelect}
            highlighted={highlighted}
            onReady={() => setTimeout(() => setMapReady(true), 100)}
          />
        </div>
      )}
    </div>
    <TaxonPanel
  taxon={selected}
  onClose={() => {
    setSelected(null)
    setHighlighted(null)
  }}
/>

    {/* Footer */}
    <footer className="shrink-0 px-8 py-3 border-t border-white/10 flex items-center gap-6" style={{ background: '#110e1a' }}>
  <span className="text-white/20 text-xs mr-auto">© 2026 DinoTime</span>
  <button onClick={() => setLegalPage('impressum')}
    className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest">
    Impressum
  </button>
  <button onClick={() => setLegalPage('datenschutz')}
    className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest">
    Datenschutz
  </button>
  <button onClick={() => setLegalPage('quellen')}
    className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-widest">
    Quellen
  </button>
</footer>

    <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />
  </div>
)
}
