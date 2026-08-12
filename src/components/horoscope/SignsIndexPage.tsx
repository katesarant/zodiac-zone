import type { Lang } from "@/lib/astro/types";
import { dict, tSign } from "@/lib/astro/i18n";
import { SIGNS } from "@/lib/astro/engine";
import { SIGN_GLYPHS, formatLongDate, signPath } from "@/lib/horoscope/signs";
import { PathLink } from "./PathLink";

export function SignsIndexPage({ lang, dataKey }: { lang: Lang; dataKey: string | null }) {
  const t = dict(lang);
  const z = t.zodiac;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{z.title}</h1>
      <p className="mt-2 max-w-[58ch] font-body text-sm text-muted-foreground">{z.intro}</p>
      {dataKey ? (
        <p className="mt-1 font-body text-xs text-muted-foreground">
          {z.updated}: {formatLongDate(dataKey, lang)}
        </p>
      ) : null}

      <h2 className="mt-8 font-display text-lg font-semibold text-primary">{z.pickSign}</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SIGNS.map((s, i) => (
          <li key={s}>
            <PathLink
              href={signPath(i, lang)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 font-body text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <span aria-hidden="true" className="text-lg text-primary">
                {SIGN_GLYPHS[i]}
              </span>
              {tSign(s, lang)}
            </PathLink>
          </li>
        ))}
      </ul>

      <p className="mt-10 font-body text-xs text-muted-foreground">{t.footer}</p>
    </main>
  );
}
