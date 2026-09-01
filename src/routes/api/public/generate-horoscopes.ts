import { createFileRoute } from "@tanstack/react-router";

import { SIGNS } from "@/lib/astro/engine";
import { tAspect, tPlanet, tSign } from "@/lib/astro/i18n";
import type { Horoscope, HoroscopePeriod, Lang } from "@/lib/astro/types";

type TransitPeriod = "month" | "year";

const LANGS: Lang[] = ["el", "en"];
const PERIODS: HoroscopePeriod[] = ["daily", "month", "year"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Calendar parts of `now` in Europe/Athens, independent of the host TZ. */
function athensParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const iso = fmt.format(now);
  const [year, month, day] = iso.split("-").map(Number) as [number, number, number];
  return { year, month, day, iso };
}

/** Previous key for the same period — the source of the fallback reading. */
function previousKey(period: HoroscopePeriod, key: string): string {
  if (period === "year") return String(Number(key) - 1);
  if (period === "month") {
    const [y, m] = key.split("-").map(Number) as [number, number];
    const d = new Date(Date.UTC(y, m - 2, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Scheduled generator: writes the missing daily/monthly/yearly readings for
 * both languages into the database. One AI call per language and period.
 */
export const Route = createFileRoute("/api/public/generate-horoscopes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: config } = await supabaseAdmin
          .from("horoscope_cron_config")
          .select("token")
          .maybeSingle();
        const expected = config?.token;
        if (!expected) return json({ error: "generator not configured" }, 500);

        const provided = request.headers.get("x-horoscope-cron-secret") ?? "";
        if (!timingSafeEqual(provided, expected)) return json({ error: "Unauthorized" }, 401);

        let body: { date?: string; force?: boolean } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          body = {};
        }

        const now = new Date();
        const parts =
          body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
            ? (() => {
                const [y, m, d] = body.date!.split("-").map(Number) as [number, number, number];
                return { year: y, month: m, day: d, iso: body.date! };
              })()
            : athensParts(now);

        const keyFor: Record<HoroscopePeriod, string> = {
          daily: parts.iso,
          month: `${parts.year}-${String(parts.month).padStart(2, "0")}`,
          year: String(parts.year),
        };

        const { data: existing } = await supabaseAdmin
          .from("horoscopes")
          .select("period, key, lang")
          .in("key", PERIODS.map((p) => keyFor[p]));
        const have = new Set((existing ?? []).map((r) => `${r.period}:${r.key}:${r.lang}`));

        const todo: Array<{ period: HoroscopePeriod; key: string; lang: Lang }> = [];
        for (const period of PERIODS) {
          for (const lang of LANGS) {
            if (body.force || !have.has(`${period}:${keyFor[period]}:${lang}`)) {
              todo.push({ period, key: keyFor[period], lang });
            }
          }
        }

        if (todo.length === 0) {
          return json({ ok: true, date: parts.iso, generated: [], skipped: "already present" });
        }

        const { generateHoroscopeBatch } = await import("@/lib/astro/generate.server");
        const { skyForDate, transitsForSign } = await import("@/lib/astro/transits.server");
        const { invalidateHoroscopeCache } = await import("@/lib/horoscope/files.server");

        const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const sky = await skyForDate(date);

        const done: string[] = [];
        const failed: string[] = [];
        let reused = 0;

        for (const job of todo) {
          const transitPeriod: TransitPeriod | undefined =
            job.period === "daily" ? undefined : (job.period as TransitPeriod);

          const signInputs = SIGNS.map((s, i) => {
            const raw = transitsForSign(sky, i, transitPeriod);
            const localised =
              job.lang === "en"
                ? {
                    sign: tSign(raw.sign, job.lang),
                    moonSign: tSign(raw.moonSign, job.lang),
                    moonPhase: raw.moonPhase,
                    transits: raw.transits.map((t) => ({
                      ...t,
                      planet: tPlanet(t.planet, job.lang),
                      sign: tSign(t.sign, job.lang),
                      aspect: tAspect(t.aspect, job.lang),
                    })),
                  }
                : raw;
            return { sign: tSign(s, job.lang), sky: localised };
          });

          let readings: Horoscope[] | null = null;
          for (let attempt = 1; attempt <= 2 && !readings; attempt++) {
            try {
              const res = await generateHoroscopeBatch(
                { period: job.period, date: job.key, signs: signInputs },
                job.lang,
              );
              if (res.data && res.data.length >= 12) readings = res.data;
              else {
                console.warn(
                  `[horoscopes] ${job.period} ${job.key} ${job.lang} attempt ${attempt} unusable (banned: ${res.bannedTerms.join(", ")})`,
                );
              }
            } catch (err) {
              console.warn(
                `[horoscopes] ${job.period} ${job.key} ${job.lang} attempt ${attempt} failed: ${String(err)}`,
              );
            }
          }

          // Fallback: keep the previous period's reading rather than a blank page.
          let previous: Horoscope[] = [];
          if (!readings) {
            const { data: prev } = await supabaseAdmin
              .from("horoscopes")
              .select("signs")
              .eq("period", job.period)
              .eq("lang", job.lang)
              .eq("key", previousKey(job.period, job.key))
              .maybeSingle();
            previous = (prev?.signs ?? []) as unknown as Horoscope[];
            if (previous.length === 0) {
              failed.push(`${job.period}:${job.key}:${job.lang}`);
              continue;
            }
            reused += previous.length;
          }

          const signs: Horoscope[] = SIGNS.map((s, i) => {
            const name = tSign(s, job.lang);
            const source =
              readings?.find((r) => r.sign === name) ??
              readings?.[i] ??
              previous.find((r) => r.sign === name) ??
              previous[i];
            return {
              sign: name,
              period: job.period,
              date: job.key,
              sky: source?.sky ?? "",
              tone: source?.tone ?? "",
              focus: source?.focus ?? "",
              keyTransit: source?.keyTransit ?? "",
            };
          });

          const { error } = await supabaseAdmin.from("horoscopes").upsert(
            {
              period: job.period,
              key: job.key,
              lang: job.lang,
              signs: signs as unknown as never,
              generated_at: new Date().toISOString(),
            },
            { onConflict: "period,key,lang" },
          );
          if (error) {
            console.error(`[horoscopes] save failed ${job.period} ${job.key} ${job.lang}:`, error.message);
            failed.push(`${job.period}:${job.key}:${job.lang}`);
            continue;
          }
          done.push(`${job.period}:${job.key}:${job.lang}`);
        }

        invalidateHoroscopeCache();

        return json({
          ok: failed.length === 0,
          date: parts.iso,
          generated: done,
          reused,
          failed,
        });
      },
    },
  },
});
