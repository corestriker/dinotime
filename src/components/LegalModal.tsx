interface Props {
  page:    'impressum' | 'datenschutz' | 'quellen' | null
  onClose: () => void
}

export default function LegalModal({ page, onClose }: Props) {
  if (!page) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-16 bottom-16 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[640px] z-50 flex flex-col rounded-lg border border-white/10 overflow-hidden" style={{ background: '#110e1a' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-widest">
            {page === 'impressum'    && 'Impressum'}
            {page === 'datenschutz' && 'Datenschutzerklärung'}
            {page === 'quellen'     && 'Quellen & Lizenzen'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/80 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Inhalt */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-white/60 leading-relaxed space-y-4">
          {page === 'impressum'    && <Impressum />}
          {page === 'datenschutz' && <Datenschutz />}
          {page === 'quellen'     && <Quellen />}
        </div>
      </div>
    </>
  )
}

function Impressum() {
  return (
    <>
      <h3 className="text-white/80 font-semibold">Angaben gemäß § 5 TMG</h3>
      <p>
        Leon Bethke<br />
        Poststraße 8<br />
        27711 Osterholz-Scharmbeck<br />
        Deutschland
      </p>

      <h3 className="text-white/80 font-semibold">Kontakt</h3>
      <p>E-Mail: core.app.dev@protonmail.com</p>

      <h3 className="text-white/80 font-semibold">Hinweis</h3>
      <p>
        Diese Website ist ein privates, nicht-kommerzielles Projekt. 
        Alle dargestellten Daten stammen aus öffentlich zugänglichen 
        wissenschaftlichen Datenbanken.
      </p>
    </>
  )
}

function Datenschutz() {
  return (
    <>
      <h3 className="text-white/80 font-semibold">1. Datenschutz auf einen Blick</h3>
      <p>
        Diese Website erhebt keine personenbezogenen Daten. Es werden keine 
        Cookies gesetzt, kein Tracking durchgeführt und keine Daten an Dritte 
        weitergegeben.
      </p>

      <h3 className="text-white/80 font-semibold">2. Externe Dienste</h3>
      <p>
        Beim Abrufen von Bildern werden Verbindungen zu externen Diensten 
        hergestellt:
      </p>
      <ul className="list-disc list-inside space-y-1 text-white/50">
        <li>
          <strong className="text-white/60">Wikipedia</strong> – Bilder und 
          Artikeldaten werden über die Wikipedia REST API geladen. 
          Es gelten die Datenschutzbestimmungen der Wikimedia Foundation.
        </li>
        <li>
          <strong className="text-white/60">PhyloPic</strong> – Silhouetten 
          werden über die PhyloPic API geladen. 
          Es gelten die Datenschutzbestimmungen von PhyloPic.
        </li>
        <li>
          <strong className="text-white/60">CARTO</strong> – Kartenkacheln 
          werden von CARTO geladen. Es gelten die Datenschutzbestimmungen 
          von CARTO.
        </li>
      </ul>

      <h3 className="text-white/80 font-semibold">3. Hosting</h3>
      <p>
        Diese Website wird über GitHub Pages gehostet. Es gelten die 
        Datenschutzbestimmungen von GitHub (Microsoft).
      </p>

      <h3 className="text-white/80 font-semibold">4. Verantwortlicher</h3>
      <p>
        Verantwortlich für den Datenschutz auf dieser Website ist die im 
        Impressum genannte Person.
      </p>
    </>
  )
}

function Quellen() {
  return (
    <>
      <h3 className="text-white/80 font-semibold">Paläontologische Daten</h3>
      <p>
        Die Fossil- und Zeitraumdaten stammen aus der{' '}
        
        <a  href="https://paleobiodb.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          Paleobiology Database (PBDB)
        </a>
        , lizenziert unter{' '}
        
         <a href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          CC BY 4.0
        </a>
        .
      </p>

      <h3 className="text-white/80 font-semibold">Bilder</h3>
      <p>
        Bilder werden über die{' '}
        
        <a  href="https://en.wikipedia.org/api/rest_v1/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          Wikipedia REST API
        </a>{' '}
        geladen und stehen unter den jeweiligen Lizenzen der Wikimedia 
        Foundation. Durch Klick auf einen Artikel gelangen Sie zur 
        Originalquelle mit vollständigen Lizenzangaben.
      </p>

      <h3 className="text-white/80 font-semibold">Silhouetten</h3>
      <p>
        Silhouetten stammen von{' '}
        
        <a  href="https://www.phylopic.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          PhyloPic
        </a>
        . Die jeweiligen Lizenzen (meist CC0 oder CC BY) sind auf der 
        PhyloPic-Website einsehbar.
      </p>

      <h3 className="text-white/80 font-semibold">Karten</h3>
      <p>
        Kartenkacheln von{' '}
        
        <a  href="https://carto.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          CARTO
        </a>
        {' '}© OpenStreetMap-Mitwirkende.
      </p>
    </>
  )
}