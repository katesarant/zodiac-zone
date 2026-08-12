/**
 * Horoscope file generator — runs with bun inside the container via cron,
 * NOT as part of the web app.
 *
 *   TZ=Europe/Athens
 *   0 0 * * *  cd /app && bun scripts/generate-horoscopes.ts >> /var/log/horoscopes.log 2>&1
 *
 * Writes one file per date/period and language, keeping all past files as an
 * archive: data/horoscopes/daily/<YYYY-MM-DD>.<lang>.json
 *           data/horoscopes/monthly/<YYYY-MM>.<lang>.json
 *           data/horoscopes/yearly/<YYYY>.<lang>.json
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateHoroscope } from "../src/lib/astro/generate.server";
import { SIGNS } from "../src/lib/astro/engine";
import { tPlanet, tSign, tAspect } from "../src/lib/astro/i18n";
import {
  skyForDate,
  transitsForSign,
  type SignTransits,
  type TransitPeriod,
} from "../src/lib/astro/transits.server";
import type { Horoscope, HoroscopePeriod, Lang } from "../src/lib/astro/types";

const LANGS: Lang[] = ["el", "en"];
const ROOT = path.resolve(import.meta.dir, "..", "data", "horoscopes");
const DIRS: Record<HoroscopePeriod, string> = {
  daily: path.join(ROOT, "daily"),
  month: path.join(ROOT, "monthly"),
  year: path.join(ROOT, "yearly"),
};

interface HoroscopeFile {
  period: HoroscopePeriod;
  key: string;
  lang: Lang;
  generatedAt: string;
  signs: Horoscope[];
}

/** Calendar parts of `now` in Europe/Athens, independent of the host TZ. */
function athensParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = fmt.format(now).split("-").map(Number) as [number, number, number];
  return { year, month, day, iso: fmt.format(now) };
}

function fileFor(period: HoroscopePeriod, key: string, lang: Lang): string {
  return path.join(DIRS[period], `${key}.${lang}.json`);
}

/** Sky data as sent to the model, translated for EN. */
function localiseSky(sky: SignTransits, lang: Lang) {
  if (lang !== "en") return sky;
  return {
    sign: tSign(sky.sign, lang),
    moonSign: tSign(sky.moonSign, lang),
    moonPhase: sky.moonPhase,
    transits: sky.transits.map((t) => ({
      ...t,
      planet: tPlanet(t.planet, lang),
      sign: tSign(t.sign, lang),
      aspect: tAspect(t.aspect, lang),
    })),
  };
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

/** Previous file key for the same period, used as the fallback source. */
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

interface Stats {
  generated: number;
  reused: number;
  rejected: number;
}

async function generatePeriod(
  period: HoroscopePeriod,
  key: string,
  date: Date,
  stats: Stats,
): Promise<void> {
  await mkdir(DIRS[period], { recursive: true });

  const done = LANGS.every((lang) => existsSync(fileFor(period, key, lang)));
  if (done) {
    console.log(`[horoscopes] ${period} ${key} already present — skipping`);
    return;
  }

  const transitPeriod: TransitPeriod | undefined =
    period === "daily" ? undefined : (period as TransitPeriod);
  const sky = await skyForDate(date);

  for (const lang of LANGS) {
    const target = fileFor(period, key, lang);
    if (existsSync(target)) continue;

    const fallback = await readJson<HoroscopeFile>(
      fileFor(period, previousKey(period, key), lang),
    );

    const signs: Horoscope[] = [];
    for (let i = 0; i < 12; i++) {
      const signEl = SIGNS[i]!;
      const signName = tSign(signEl, lang);
      const skyData = localiseSky(transitsForSign(sky, i, transitPeriod), lang);

      let entry: Horoscope | null = null;
      for (let attempt = 1; attempt <= 3 && !entry; attempt++) {
        try {
          const res = await generateHoroscope(
            { sign: signName, period, date: key, sky: skyData },
            lang,
          );
          if (res.data) {
            entry = { ...res.data, sign: signName, period, date: key };
          } else {
            stats.rejected++;
            console.warn(
              `[horoscopes] ${key} ${lang} ${signName} rejected by banned filter: ${res.bannedTerms.join(", ")}`,
            );
          }
        } catch (err) {
          console.warn(
            `[horoscopes] ${key} ${lang} ${signName} attempt ${attempt} failed: ${String(err)}`,
          );
        }
      }

      if (entry) {
        signs.push(entry);
        stats.generated++;
      } else {
        const old = fallback?.signs.find((s) => s.sign === signName);
        if (old) {
          signs.push({ ...old, date: key, period });
          stats.reused++;
        } else {
          console.error(`[horoscopes] ${key} ${lang} ${signName} — no text and no fallback`);
        }
      }
    }

    const payload: HoroscopeFile = {
      period,
      key,
      lang,
      generatedAt: new Date().toISOString(),
      signs,
    };
    await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  }
}

async function main() {
  const now = new Date();
  const { year, month, day, iso } = athensParts(now);
  const stats: Stats = { generated: 0, reused: 0, rejected: 0 };

  await mkdir(ROOT, { recursive: true });

  const dailyDone = LANGS.every((lang) => existsSync(fileFor("daily", iso, lang)));
  if (dailyDone) {
    console.log(`[horoscopes] ${iso} already generated — exiting without AI calls`);
    return;
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  await generatePeriod("daily", iso, date, stats);

  if (day === 1) {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    await generatePeriod("month", monthKey, date, stats);
  }
  if (day === 1 && month === 1) {
    await generatePeriod("year", String(year), date, stats);
  }

  console.log(
    `[horoscopes] ${iso} generated=${stats.generated} reused=${stats.reused} rejected=${stats.rejected}`,
  );
}

main().catch((err) => {
  console.error("[horoscopes] fatal:", err);
  process.exit(1);
});
