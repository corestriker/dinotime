import type { Taxon } from "../types"

// Farben pro Gruppe
const GROUP_COLORS: Record<string, string> = {
  'Dinosauria': 'text-neutral-300 border-l-2 border-l-sky-500 border-y-0 border-r-0 bg-white/[0.02] hover:bg-white/[0.05] pl-3',
  'Reptilia':   'text-neutral-300 border-l-2 border-l-violet-500 border-y-0 border-r-0 bg-white/[0.02] hover:bg-white/[0.05] pl-3',
}

const GROUP_DOT: Record<string, string> = {
  'Dinosauria': 'bg-sky-500',
  'Reptilia':   'bg-violet-500',
}

interface Props {
  taxa:        Taxon[]
  onSelect:    (t: Taxon) => void
  highlighted: string | null
}

export default function TaxonList({ taxa, onSelect, highlighted}: Props) {
  if (taxa.length === 0) return (
    <div className="flex-1 flex items-center justify-center text-neutral-500 italic">
      No species in this time range.
    </div>
  )

  // Gruppe Dinosauria und Reptilia trennen
  const dinos    = taxa.filter(t => t.group === 'Dinosauria')
  const reptiles = taxa.filter(t => t.group === 'Reptilia')

  return (
    <div className="h-full flex flex-col">
    <main className="flex-1 overflow-y-auto px-6 py-4">

      {/* Legende */}
      <div className="flex gap-4 mb-4">
        {Object.entries(GROUP_DOT).map(([group, dot]) => (
          <div key={group} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-xs text-neutral-400">{group}</span>
          </div>
        ))}
      </div>

      {/* Zwei Spalten nebeneinander */}
      <div className="grid grid-cols-2 gap-6">
        <Section label="Dinosauria" taxa={dinos}    onSelect={onSelect} colorClass={GROUP_COLORS['Dinosauria']} highlighted={highlighted} />
        <Section label="Reptilia"   taxa={reptiles} onSelect={onSelect} colorClass={GROUP_COLORS['Reptilia']}   highlighted={highlighted} />
      </div>

    </main>
    </div>
  )
}

function Section({ label, taxa, onSelect, colorClass, highlighted }: {
  label:       string
  taxa:        Taxon[]
  onSelect:    (t: Taxon) => void
  colorClass:  string
  highlighted: string | null
}) {
  if (taxa.length === 0) return null

  return (
    <div>
      <h2 className={`text-xs uppercase tracking-widest mb-2 ${colorClass.split(' ')[0]}`}>
        {label} <span className="text-neutral-500 font-normal">({taxa.length})</span>
      </h2>
      <div className="flex flex-col gap-0.5">
        {taxa.map(t => (
          <button
            key={t.name}
            onClick={() => onSelect(t)}
            className={`
              w-full text-left px-2.5 py-1 rounded border text-xs italic
              transition-all duration-150
              ${t.name === highlighted
                ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200'
                : colorClass
              }
            `}
          >
            <span className="font-medium not-italic">{t.name}</span>
            <span className="text-white/20 ml-1.5">{t.start}–{t.end} Ma</span>
          </button>
        ))}
      </div>
    </div>
  )
}