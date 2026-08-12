import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { Lang } from "@/lib/astro/types";
import { dict, tSign } from "@/lib/astro/i18n";
import { SIGNS } from "@/lib/astro/engine";
import { SIGN_GLYPHS, formatLongDate, periodPath, signPath } from "@/lib/horoscope/signs";
import { getAllSignsFn } from "@/lib/horoscope/horoscope.functions";
import { field } from "@/lib/ui";
import { PathLink } from "./PathLink";

type Period = "daily" | "month" | "year";

export function SignsIndexPage({ lang, dataKey }: { lang: Lang; dataKey: string | null }) {
  const t = dict(lang);
  const z = t.zodiac;
  const [period, setPeriod] = useState<Period>("daily");
  const fetchAll = useServerFn(getAllSignsFn);

  const { data, isFetching } = useQuery({
    queryKey: ["horoscopes", lang, period],
    queryFn: () => fetchAll({ data: { lang, period } }),
  });

  const shownKey = data?.key ?? (period === "daily" ? dataKey : null);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{z.title}</h1>
      <p className="mt-2 max-w-[58ch] font-body text-sm text-muted-foreground">{z.intro}</p>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="block w-auto min-w-[10rem]">
          <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
            {z.periodLabel}
          </span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className={field}
          >
            <option value="daily">{z.today}</option>
            <option value="month">{z.month}</option>
            <option value="year">{z.year}</option>
          </select>
        </label>
        {shownKey ? (
          <span className="font-body text-xs text-muted-foreground">
            {z.updated}: {formatLongDate(shownKey, lang)}
          </span>
        ) : null}
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-primary">{z.allReadings}</h2>

      {isFetching && !data ? (
        <p className="mt-3 font-body text-sm text-muted-foreground">{z.loading}</p>
      ) : null}

      <ul className="mt-3 space-y-3">
        {SIGNS.map((s, i) => {
          const reading = data?.signs?.[i] ?? null;
          return (
            <li key={s} className="panel p-4 sm:p-5">
              <div className="flex items-baseline gap-2">
                <span aria-hidden="true" className="font-display text-xl text-primary">
                  {SIGN_GLYPHS[i]}
                </span>
                <h3 className="font-display text-base font-semibold text-foreground">{tSign(s, lang)}</h3>
                {reading?.keyTransit ? (
                  <span className="ml-auto inline-flex items-center rounded-full border border-primary/40 px-2.5 py-0.5 font-body text-[11px] text-primary">
                    {reading.keyTransit}
                  </span>
                ) : null}
              </div>

              {reading ? (
                <>
                  <p className="mt-2 font-body text-sm leading-relaxed text-foreground/90">{reading.sky}</p>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-foreground/80">{reading.tone}</p>
                  <PathLink
                    href={period === "daily" ? signPath(i, lang) : periodPath(i, lang, period)}
                    className="mt-3 inline-flex rounded-lg border border-border px-3 py-1.5 font-body text-xs text-foreground transition-colors hover:bg-secondary"
                  >
                    {z.readMore}
                  </PathLink>
                </>
              ) : (
                <p className="mt-2 font-body text-sm text-muted-foreground">{z.empty}</p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-10 font-body text-xs text-muted-foreground">{t.footer}</p>
    </main>
  );
}
