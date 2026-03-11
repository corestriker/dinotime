import { useRef, useCallback, useEffect, useState } from 'react'
import type { RangeValue } from '../types'

const ERAS = [
  { name: 'Karbon',   start: 323, end: 252, color: '#6b3fa0' },
  { name: 'Trias',    start: 252, end: 201, color: '#8b4513' },
  { name: 'Jura',     start: 201, end: 145, color: '#2a5a3a' },
  { name: 'Kreide',   start: 145, end: 66,  color: '#1a3a6a' },
  { name: 'Paläogen', start: 66,  end: 23,  color: '#4a2a1a' },
  { name: 'Neogen',   start: 23,  end: 2.6, color: '#2a4a1a' },
  { name: 'Quartär',  start: 2.6, end: 0,   color: '#1a2a4a' },
]

const MAX_MA = 323
const THUMB_PX = 10

interface Props {
  value:    RangeValue
  onChange: (v: RangeValue) => void
}

export default function RangeSlider({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'from' | 'to' | null>(null)
  
  // Lokaler State nur für die Anzeige während des Ziehens
  const [localValue, setLocalValue] = useState(value)

  // Wenn value von außen sich ändert (z.B. durch Suche) → sync
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const trackWidth = useRef<number>(0)

  useEffect(() => {
    if (!trackRef.current) return
    const updateWidth = () => {
      if (trackRef.current) {
        trackWidth.current = trackRef.current.getBoundingClientRect().width
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Rechnet Ma → Prozent, aber lässt 10px Rand für die Griffe
  const toPercent = useCallback((ma: number) => {
      const w = trackRef.current?.getBoundingClientRect().width ?? 0
      if (!w) return ((MAX_MA - ma) / MAX_MA) * 100
      const usable = w - THUMB_PX * 2
      const px = ((MAX_MA - ma) / MAX_MA) * usable + THUMB_PX
      return (px / w) * 100
    }, [])
    const xToMa = useCallback((clientX: number): number => {
      if (!trackRef.current) return 0
      const rect = trackRef.current.getBoundingClientRect()
      const usable = rect.width - THUMB_PX * 2
      const px = clientX - rect.left - THUMB_PX
      const pct = Math.max(0, Math.min(1, px / usable))
      return Math.round(MAX_MA - pct * MAX_MA)
    }, [])


    const onPointerDown = useCallback((e: React.PointerEvent) => {
      const clickMa  = xToMa(e.clientX)
      const distFrom = Math.abs(clickMa - value.from)
      const distTo   = Math.abs(clickMa - value.to)

      // Nächsten Griff auswählen
      dragging.current = distFrom <= distTo ? 'from' : 'to'

      // Pointer capturen – Mausbewegungen kommen auch außerhalb des Elements an
      e.currentTarget.setPointerCapture(e.pointerId)
    }, [value, xToMa])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
      if (!dragging.current) return
      const ma = xToMa(e.clientX)

      setLocalValue(prev => {
        if (dragging.current === 'from') {
          return { ...prev, from: Math.max(ma, prev.to + 1) }
        } else {
          return { ...prev, to: Math.min(ma, prev.from - 1) }
        }
      })
    }, [xToMa])

    const onPointerUp = useCallback(() => {
      if (dragging.current) {
        onChange(localValue)
      }
      dragging.current = null
    }, [localValue, onChange])

  return (
    <div className="px-6 py-3 border-b border-white/5" style={{ background: '#110e1a' }}>

        <div>
            {/* Aktuelle Werte */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-white/20">Time range</span>
                <div className="flex items-center gap-2 font-mono text-xs text-sky-400">
                  <span className="px-2 py-0.5 rounded border border-white/10" style={{ background: '#1a1625' }}>{localValue.from} Ma</span>
                  <span className="text-white/20">—</span>
                  <span className="px-2 py-0.5 rounded border border-white/10" style={{ background: '#1a1625' }}>{localValue.to} Ma</span>
                </div>
            </div>

            {/* Track – hier hören wir auf Pointer-Events */}
            <div
                ref={trackRef}
                className="relative h-10 flex items-center cursor-pointer select-none mt-6 "
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
            {/* Jahres-Ruler */}
            <div className="absolute inset-x-0 -top-5">
            {Array.from({ length: Math.floor(MAX_MA / 10) + 1 }, (_, i) => i * 10).map(ma => {
                // ma=0 ist "heute" (rechts), ma=320 ist "alt" (links)
                // toPercent rechnet: wie weit von links ist dieser Wert?
                const pct = toPercent(ma)
                return (
                <div
                    key={ma}
                    className="absolute flex flex-col items-center -translate-x-1/2" 
                    style={{ left: `${pct}%` }}
                >
                    <div className="w-px h-1.5 bg-neutral-600" />
                    {ma % 20 === 0 && (
                    <span className="text-[9px] text-neutral-500 mt-0.5">
                        {ma}
                    </span>
                    )}
                </div>
                )
            })}
            </div>
            {/* Zeitalter-Farbbalken */}
            <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden flex">
            {ERAS.map(era => (
                <div
                key={era.name}
                style={{
                    width:      `${((era.start - era.end) / MAX_MA) * 100}%`,
                    background: era.color,
                }}
                />
            ))}
            </div>

            {/* Aktiver Bereich zwischen den Griffen */}
            <div
              className="absolute h-2 bg-sky-400/30 border border-sky-400/50 pointer-events-none"
              style={{
                left:  `${toPercent(localValue.from)}%`,
                width: `${toPercent(localValue.to) - toPercent(localValue.from)}%`,
              }}
            />

            {/* Griff: ältere Grenze (from) */}
            <div
              className="absolute w-5 h-5 rounded-full bg-sky-400 border-2 border-neutral-950 shadow-lg -translate-x-1/2 pointer-events-none"
              style={{ left: `${toPercent(localValue.from)}%` }}
            />

            {/* Griff: jüngere Grenze (to) */}
            <div
              className="absolute w-5 h-5 rounded-full bg-sky-400 border-2 border-neutral-950 shadow-lg -translate-x-1/2 pointer-events-none"
              style={{ left: `${toPercent(localValue.to)}%` }}
            />
        </div>

        {/* Zeitalter Labels */}
        <div className="relative h-5 mt-1 overflow-hidden">
            {ERAS.map(era => (
            <span
                key={era.name}
                className="absolute text-[10px] -translate-x-1/2 text-neutral-500 whitespace-nowrap"
                style={{ left: `${toPercent(era.start)}%` }}
            >
                {era.name}
            </span>
            ))}
        </div>

      </div>
    </div>
  )
}