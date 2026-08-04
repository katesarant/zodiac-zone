import { SIGNS } from "@/lib/astro/engine";
import { dict, ordinalHouse, tAspect, tPlanet, tSign } from "@/lib/astro/i18n";
import type { ChartJson, Lang } from "@/lib/astro/types";

const GLYPHS: Record<string, string> = {
  Ήλιος: "☉",
  Σελήνη: "☾",
  Ερμής: "☿",
  Αφροδίτη: "♀",
  Άρης: "♂",
  Δίας: "♃",
  Κρόνος: "♄",
  Ουρανός: "♅",
  Ποσειδώνας: "♆",
  Πλούτωνας: "♇",
};

const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const lonOf = (sign: string, degree: number) => SIGNS.indexOf(sign) * 30 + degree;

/** Ecliptic longitude → SVG point, with the Ascendant on the left horizon. */
function point(lon: number, asc: number, radius: number) {
  const a = ((lon - asc + 180) * Math.PI) / 180;
  return { x: 200 + radius * Math.cos(a), y: 200 - radius * Math.sin(a) };
}

export function ChartWheel({ chart }: { chart: ChartJson; lang?: Lang }) {
  const asc = lonOf(chart.angles.asc.sign, chart.angles.asc.degree);

  return (
    <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-md" role="img" aria-label="natal chart">
      <circle cx="200" cy="200" r="190" className="fill-card stroke-border" strokeWidth="1" />
      <circle cx="200" cy="200" r="150" className="fill-none stroke-border" strokeWidth="1" />
      <circle cx="200" cy="200" r="95" className="fill-none stroke-border" strokeWidth="1" />

      {Array.from({ length: 12 }, (_, i) => {
        const start = point(i * 30, asc, 190);
        const inner = point(i * 30, asc, 95);
        const mid = point(i * 30 + 15, asc, 170);
        const houseMid = point(i * 30 + 15, asc, 112);
        return (
          <g key={i}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={start.x}
              y2={start.y}
              className="stroke-border"
              strokeWidth="1"
            />
            <text
              x={mid.x}
              y={mid.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary"
              fontSize="18"
            >
              {SIGN_GLYPHS[i]}
            </text>
            <text
              x={houseMid.x}
              y={houseMid.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {chart.aspects.map((a, i) => {
        const pa = chart.planets.find((p) => p.name === a.a);
        const pb = chart.planets.find((p) => p.name === a.b);
        if (!pa || !pb) return null;
        const p1 = point(lonOf(pa.sign, pa.degree), asc, 95);
        const p2 = point(lonOf(pb.sign, pb.degree), asc, 95);
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            className={a.angle === 90 || a.angle === 180 ? "stroke-destructive" : "stroke-primary"}
            strokeWidth="0.7"
            opacity="0.5"
          />
        );
      })}

      {/* degree ticks: every 5° short, every 10° long */}
      {Array.from({ length: 72 }, (_, i) => {
        const lon = i * 5;
        const long = i % 2 === 0;
        const outer = point(lon, asc, 150);
        const inner = point(lon, asc, long ? 140 : 145);
        return (
          <line
            key={`tick-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            className="stroke-border"
            strokeWidth={long ? 0.9 : 0.5}
            opacity={long ? 0.9 : 0.6}
          />
        );
      })}

      {chart.planets.map((p) => {
        const lon = lonOf(p.sign, p.degree);
        const pt = point(lon, asc, 128);
        const deg = point(lon, asc, 110);
        const marker = point(lon, asc, 150);
        const markerIn = point(lon, asc, 138);
        return (
          <g key={p.name}>
            <line
              x1={markerIn.x}
              y1={markerIn.y}
              x2={marker.x}
              y2={marker.y}
              className="stroke-primary"
              strokeWidth="1"
              opacity="0.8"
            />
            <text
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              fontSize="16"
            >
              {GLYPHS[p.name] ?? p.name}
            </text>
            <text
              x={deg.x}
              y={deg.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary"
              fontSize="9"
              fontWeight="600"
            >
              {Math.floor(p.degree)}°{p.retrograde ? "℞" : ""}
            </text>
          </g>
        );
      })}

      <text
        x={point(asc, asc, 200).x + 8}
        y={200}
        textAnchor="start"
        dominantBaseline="central"
        className="fill-primary"
        fontSize="11"
        fontWeight="600"
      >
        AC {Math.floor(chart.angles.asc.degree)}°
      </text>
      {(() => {
        const mcLon = lonOf(chart.angles.mc.sign, chart.angles.mc.degree);
        const mc = point(mcLon, asc, 176);
        return (
          <text
            x={mc.x}
            y={mc.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-primary"
            fontSize="11"
            fontWeight="600"
          >
            MC {Math.floor(chart.angles.mc.degree)}°
          </text>
        );
      })()}
    </svg>
  );
}

export function ChartTables({ chart, lang }: { chart: ChartJson; lang: Lang }) {
  const t = dict(lang);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section>
        <h4 className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">{t.planets}</h4>
        <ul className="divide-y divide-border text-sm">
          {chart.planets.map((p) => (
            <li key={p.name} className="flex items-center justify-between py-1.5">
              <span className="text-foreground">
                {GLYPHS[p.name] ?? ""} {tPlanet(p.name, lang)}
                {p.retrograde && <span className="ml-1 text-xs text-muted-foreground">℞</span>}
              </span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-primary">{p.degree.toFixed(1)}°</span>{" "}
                {tSign(p.sign, lang)} · {ordinalHouse(p.house, lang)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between py-1.5">
            <span>{t.asc}</span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-primary">{chart.angles.asc.degree.toFixed(1)}°</span>{" "}
              {tSign(chart.angles.asc.sign, lang)}
            </span>
          </li>
          <li className="flex items-center justify-between py-1.5">
            <span>{t.mc}</span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-primary">{chart.angles.mc.degree.toFixed(1)}°</span>{" "}
              {tSign(chart.angles.mc.sign, lang)}
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h4 className="mb-3 text-xs uppercase tracking-[0.2em] text-primary">{t.aspects}</h4>
        <ul className="divide-y divide-border text-sm">
          {chart.aspects.map((a, i) => (
            <li key={i} className="flex items-center justify-between py-1.5">
              <span>
                {tPlanet(a.a, lang)} {tAspect(a.type, lang)} {tPlanet(a.b, lang)}
              </span>
              <span className="text-muted-foreground">orb {a.orb.toFixed(1)}°</span>
            </li>
          ))}
          {chart.aspects.length === 0 && (
            <li className="py-1.5 text-muted-foreground">Καμία όψη εντός ορίων.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
