export function SiteConnectivity({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 520"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Site structure diagram"
      role="img"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.85" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background surface */}
      <rect x="0" y="0" width="800" height="520" rx="16" fill="var(--color-card)" />

      {/* Title */}
      <text x="400" y="36" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--color-primary)">
        Site structure / Δομή site
      </text>

      {/* Root node */}
      <g transform="translate(400, 72)">
        <circle r="28" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#glow)" />
        <text textAnchor="middle" y="5" fontSize="12" fontWeight="600" fill="var(--color-primary)">/</text>
      </g>

      {/* Root → locale branches */}
      <line x1="400" y1="100" x2="240" y2="150" stroke="url(#lineGrad)" strokeWidth="1.5" />
      <line x1="400" y1="100" x2="560" y2="150" stroke="url(#lineGrad)" strokeWidth="1.5" />

      {/* EL branch */}
      <g transform="translate(240, 150)">
        <rect x="-44" y="-18" width="88" height="36" rx="8" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
        <text textAnchor="middle" y="5" fontSize="13" fontWeight="600" fill="var(--color-primary)">/el</text>
      </g>

      {/* EN branch */}
      <g transform="translate(560, 150)">
        <rect x="-44" y="-18" width="88" height="36" rx="8" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
        <text textAnchor="middle" y="5" fontSize="13" fontWeight="600" fill="var(--color-primary)">/en</text>
      </g>

      {/* EL → children */}
      <line x1="240" y1="168" x2="240" y2="210" stroke="url(#lineGrad)" strokeWidth="1.5" />
      <line x1="240" y1="210" x2="120" y2="260" stroke="url(#lineGrad)" strokeWidth="1.5" />
      <line x1="240" y1="210" x2="360" y2="260" stroke="url(#lineGrad)" strokeWidth="1.5" />

      <g transform="translate(120, 260)">
        <rect x="-50" y="-16" width="100" height="32" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="11" fill="currentColor">Chart studio</text>
      </g>
      <g transform="translate(360, 260)">
        <rect x="-50" y="-16" width="100" height="32" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="11" fill="currentColor">/zodia</text>
      </g>

      {/* EN → children */}
      <line x1="560" y1="168" x2="560" y2="210" stroke="url(#lineGrad)" strokeWidth="1.5" />
      <line x1="560" y1="210" x2="440" y2="260" stroke="url(#lineGrad)" strokeWidth="1.5" />
      <line x1="560" y1="210" x2="680" y2="260" stroke="url(#lineGrad)" strokeWidth="1.5" />

      <g transform="translate(440, 260)">
        <rect x="-50" y="-16" width="100" height="32" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="11" fill="currentColor">Chart studio</text>
      </g>
      <g transform="translate(680, 260)">
        <rect x="-50" y="-16" width="100" height="32" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="11" fill="currentColor">/zodiac</text>
      </g>

      {/* Zodia children */}
      <line x1="360" y1="276" x2="360" y2="320" stroke="url(#lineGrad)" strokeWidth="1" />
      <line x1="360" y1="320" x2="280" y2="370" stroke="url(#lineGrad)" strokeWidth="1" />
      <line x1="360" y1="320" x2="440" y2="370" stroke="url(#lineGrad)" strokeWidth="1" />

      <g transform="translate(280, 370)">
        <rect x="-46" y="-14" width="92" height="28" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="10" fill="currentColor">/krios/simera</text>
      </g>
      <g transform="translate(440, 370)">
        <rect x="-46" y="-14" width="92" height="28" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="10" fill="currentColor">/krios/minas</text>
      </g>

      {/* More zodia detail */}
      <line x1="360" y1="320" x2="360" y2="420" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 3" />
      <g transform="translate(360, 420)">
        <rect x="-52" y="-14" width="104" height="28" rx="6" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" />
        <text textAnchor="middle" y="4" fontSize="10" fill="currentColor">/krios/etos & /date</text>
      </g>

      {/* Shared resources */}
      <g transform="translate(400, 480)">
        <rect x="-140" y="-16" width="280" height="32" rx="8" fill="var(--color-card)" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 2" />
        <text textAnchor="middle" y="5" fontSize="11" fill="currentColor">Shared: localStorage library · interpretations cache · static horoscope JSON</text>
      </g>

      {/* Legend */}
      <g transform="translate(24, 490)" fontSize="10" fill="currentColor">
        <circle cx="4" cy="-2" r="4" fill="var(--color-primary)" />
        <text x="14" y="2">Route</text>
        <line x1="80" y1="-2" x2="110" y2="-2" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" />
        <text x="118" y="2">Static data</text>
      </g>
    </svg>
  );
}
