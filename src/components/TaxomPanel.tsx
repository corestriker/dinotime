import type { Taxon } from "../types"
import FossilMap from "./FossilMap"


interface Props {
  taxon:    Taxon | null
  onClose:  () => void
}

export default function TaxonPanel({ taxon, onClose }: Props) {
  // Wenn kein Taxon ausgewählt → nichts anzeigen
  if (!taxon) return null
  const wikiEN = `https://en.wikipedia.org/wiki/${encodeURIComponent(taxon.wiki)}`

  return (
    <>
      {/* Dunkler Hintergrund – Klick schließt Panel */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Panel selbst */}
      <div className="fixed right-0 top-0 h-full w-80 bg-neutral-900 border-l border-neutral-800 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
              {taxon.group}
            </p>
            <h2 className="text-lg font-semibold italic text-neutral-100 leading-tight">
              {taxon.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 transition-colors text-xl leading-none mt-1"
          >
            ✕
          </button>
        </div>

        {/* Bild */}
        {taxon.imageUrl && (
          <div className={`w-full ${taxon.isPhylopic ? 'bg-neutral-100 p-6' : ''}`}>
            <img
              src={taxon.imageUrl}
              alt={taxon.name}
              className={`w-full ${taxon.isPhylopic ? 'object-contain max-h-40' : 'object-cover h-52'}`}
            />
          </div>
        )}

        {/* Infos */}
        <div className="p-5 flex flex-col gap-4 flex-1">

          {/* Zeitraum */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Time range</p>
            <p className="text-neutral-200">
              {taxon.start} – {taxon.end} Ma
              <span className="text-neutral-500 text-sm ml-2">
                ({taxon.start - taxon.end} mil. years)
              </span>
            </p>
          </div>

          {/* Rang */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Taxonomy</p>
            <p className="text-neutral-200 capitalize">{taxon.rank} · {taxon.group}</p>
          </div>

          {/* Fundorte */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Locations</p>
            <FossilMap taxon={taxon} />
            {taxon.locations.length > 0 && (
              <p className="text-xs text-white/20 mt-1">{taxon.locations.length} Locations</p>
            )}
          </div>
          {/* Wikipedia Links – nur wenn Artikel vorhanden */}
          {taxon.hasWiki && (
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Wikipedia</p>
              <div className="flex flex-col gap-2">
                 <a href={wikiEN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors text-sm text-neutral-200"
                >
                  🇬🇧 English
                </a>
              </div>
            </div>
          )}

          {/* Bildquelle */}
          {taxon.imageUrl && (
            <p className="text-xs text-neutral-600 mt-auto">
              {taxon.isPhylopic ? '🦴 Silhouette: PhyloPic' : '🖼️ Image: Wikipedia'}
            </p>
          )}

        </div>
      </div>
    </>
  )
}