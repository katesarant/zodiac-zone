import type { Horoscope, Lang } from "@/lib/astro/types";
import { dict, tSign } from "@/lib/astro/i18n";
import {
  SIGN_GLYPHS,
  SITE_URL,
  archivePath,
  formatLongDate,
  periodPath,
  signPath,
  zodiacIndexPath,
} from "@/lib/horoscope/signs";
import { SIGNS } from "@/lib/astro/engine";
import { dateModifiedFor, isoForKey } from "@/lib/horoscope/dates";
import { PathLink } from "./PathLink";

export interface ReadingPageProps {
  lang: Lang;
  signIndex: number;
  period: "daily" | "month" | "year";
  /** Key of the file actually shown (may differ from the requested one). */
  dataKey: string | null;
  requestedKey: string | null;
  isFallback: boolean;
  generatedAt: string | null;
  reading: Horoscope | null;
  /** Show the month/year links (the sign landing page). */
  showPeriodLinks?: boolean;
}

export function ReadingPage(props: ReadingPageProps) {
  const { lang, signIndex, period, dataKey, isFallback, generatedAt, reading } = props;
  const t = dict(lang);
  const z = t.zodiac;
  const signName = tSign(SIGNS[signIndex]!, lang);
  const glyph = SIGN_GLYPHS[signIndex];
  const dateLabel = dataKey ? formatLongDate(dataKey, lang) : null;

  const jsonLd =
    reading && dataKey
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${signName} — ${dateLabel}`,
          inLanguage: lang,
          datePublished: isoForKey(dataKey),
          dateModified: dateModifiedFor(dataKey, generatedAt),
          articleSection: signName,
          isAccessibleForFree: true,
          publisher: { "@type": "Organization", name: "MyZodiacMaps", url: SITE_URL },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}${
              period === "daily" && props.requestedKey
                ? archivePath(signIndex, lang, props.requestedKey)
                : periodPath(signIndex, lang, period)
            }`,
          },
        })
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}

      <nav className="mb-6 text-sm text-muted-foreground">
        <PathLink href={zodiacIndexPath(lang)} className="hover:text-foreground">
          {z.allSigns}
        </PathLink>
      </nav>

      <header className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-display text-4xl text-primary">
          {glyph}
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {signName}
        </h1>
      </header>

      {dateLabel ? (
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {period === "daily" ? dateLabel : `${z[period === "month" ? "month" : "year"]} · ${dateLabel}`}
        </p>
      ) : null}

      {isFallback ? (
        <p className="mt-4 rounded-lg border border-border/60 px-3 py-2 font-body text-sm text-muted-foreground">
          {z.fallbackNotice} {dateLabel}
        </p>
      ) : null}

      {props.showPeriodLinks ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {(["daily", "month", "year"] as const).map((p) => (
            <PathLink
              key={p}
              href={periodPath(signIndex, lang, p)}
              className="rounded-lg border border-border px-3 py-1.5 font-body text-sm text-foreground transition-colors hover:bg-secondary"
            >
              {p === "daily" ? z.today : p === "month" ? z.month : z.year}
            </PathLink>
          ))}
        </div>
      ) : null}

      {reading ? (
        <article className="panel mt-6 p-5 sm:p-6">
          {reading.keyTransit ? (
            <span className="inline-flex items-center rounded-full border border-primary/40 px-3 py-1 font-body text-xs text-primary">
              {reading.keyTransit}
            </span>
          ) : null}

          <div className="mt-4 space-y-4 font-body text-[15px] leading-relaxed text-foreground/90">
            <p>{reading.sky}</p>
            <p>{reading.tone}</p>
            <p>{reading.focus}</p>
          </div>
        </article>
      ) : (
        <p className="panel mt-6 p-5 font-body text-sm text-muted-foreground">{z.empty}</p>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-primary">{z.otherSigns}</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SIGNS.map((s, i) =>
            i === signIndex ? null : (
              <li key={s}>
                <PathLink
                  href={signPath(i, lang)}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-body text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <span aria-hidden="true" className="text-primary">
                    {SIGN_GLYPHS[i]}
                  </span>
                  {tSign(s, lang)}
                </PathLink>
              </li>
            ),
          )}
        </ul>
      </section>

      <p className="mt-10 font-body text-xs text-muted-foreground">{t.footer}</p>
    </main>
  );
}
