import { useState, useRef, useEffect } from 'react'
import type { Taxon } from '../types'

interface Props {
  taxa:     Taxon[]   // alle Taxa für die Suche
  onSelect: (t: Taxon) => void
}

export default function SearchBar({ taxa, onSelect }: Props) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState<Taxon[]>([])
  const [open,        setOpen]        = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Suggestions berechnen wenn query sich ändert
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const q = query.trim().toLowerCase()
    const hits = taxa
      .filter(t => t.name.toLowerCase().includes(q))
      .slice(0, 8)  // max 8 Vorschläge
    setSuggestions(hits)
    setOpen(hits.length > 0)
  }, [query, taxa])

  // Schließen wenn außerhalb geklickt wird
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(taxon: Taxon) {
    onSelect(taxon)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">

      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search species…"
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-1.5 pl-8 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus:border-yellow-400/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-xl z-30 overflow-hidden">
          {suggestions.map(t => (
            <button
              key={t.name}
              onClick={() => handleSelect(t)}
              className="w-full text-left px-3 py-2 hover:bg-neutral-700 transition-colors border-b border-neutral-700/50 last:border-0"
            >
              <span className="text-sm italic text-neutral-200">{t.name}</span>
              <span className={`text-xs ml-2 ${t.group === 'Dinosauria' ? 'text-yellow-400/70' : 'text-emerald-400/70'}`}>
                {t.group}
              </span>
              <span className="text-xs text-neutral-500 ml-1">
                {t.start}–{t.end} Ma
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}