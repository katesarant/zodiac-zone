import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import type { Horoscope, HoroscopePeriod, Lang } from "@/lib/astro/types";

export interface HoroscopeFile {
  period: HoroscopePeriod;
  key: string;
  lang: Lang;
  generatedAt: string;
  signs: Horoscope[];
}

/**
 * Readings live in the database and are refreshed by the scheduled generator,
 * so a new day needs no rebuild. The JSON files bundled at build time stay as
 * an offline fallback (and for scripts that run without database access).
 */
function readBundled(): Record<string, HoroscopeFile> {
  try {
    return (import.meta.glob<HoroscopeFile>("../../../data/horoscopes/**/*.json", {
      eager: true,
      import: "default",
    }) ?? {}) as Record<string, HoroscopeFile>;
  } catch {
    return {};
  }
}

const FOLDER: Record<HoroscopePeriod, string> = {
  daily: "daily",
  month: "monthly",
  year: "yearly",
};

/** period -> lang -> key -> file */
type Archive = Record<HoroscopePeriod, Record<Lang, Record<string, HoroscopeFile>>>;

function emptyArchive(): Archive {
  return {
    daily: { el: {}, en: {} },
    month: { el: {}, en: {} },
    year: { el: {}, en: {} },
  };
}

const BUNDLED: Archive = emptyArchive();

for (const [filePath, mod] of Object.entries(readBundled())) {
  const match = /\/horoscopes\/(daily|monthly|yearly)\/(.+)\.(el|en)\.json$/.exec(filePath);
  if (!match || !mod) continue;
  const [, folder, key, lang] = match as unknown as [string, string, string, Lang];
  const period = (Object.keys(FOLDER) as HoroscopePeriod[]).find((p) => FOLDER[p] === folder);
  if (!period) continue;
  BUNDLED[period][lang][key] = mod;
}

let dbClient: ReturnType<typeof createClient<Database>> | null | undefined;

function getClient() {
  if (dbClient !== undefined) return dbClient;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    dbClient = null;
    return dbClient;
  }
  dbClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  return dbClient;
}

interface CacheEntry {
  at: number;
  files: Record<string, HoroscopeFile>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

/**
 * Plain bun/node scripts (build-time sitemap check) have no `import.meta.glob`,
 * so they read the archive folder from disk instead. Never runs in the worker.
 */
let diskPromise: Promise<Record<string, HoroscopeFile>> | null = null;
function diskFiles(): Promise<Record<string, HoroscopeFile>> {
  diskPromise ??= loadDiskFiles();
  return diskPromise;
}

async function loadDiskFiles(): Promise<Record<string, HoroscopeFile>> {
  const diskCache: Record<string, HoroscopeFile> = {};
  const self = import.meta.url;
  if (typeof self !== "string" || !self.startsWith("file:")) return diskCache;
  try {
    const [{ readdirSync, readFileSync, existsSync }, path, url] = await Promise.all([
      import("node:fs"),
      import("node:path"),
      import("node:url"),
    ]);
    const here = path.dirname(url.fileURLToPath(self));
    const root = path.resolve(here, "../../../data/horoscopes");
    if (!existsSync(root)) return diskCache;
    for (const folder of readdirSync(root)) {
      for (const file of readdirSync(path.join(root, folder))) {
        if (!file.endsWith(".json")) continue;
        diskCache[`/horoscopes/${folder}/${file}`] = JSON.parse(
          readFileSync(path.join(root, folder, file), "utf8"),
        ) as HoroscopeFile;
      }
    }
  } catch {
    // no filesystem available — bundled/database data is enough
  }
  return diskCache;
}

/** Latest rows for a period/language, merged over the bundled fallback. */
async function archiveFor(
  period: HoroscopePeriod,
  lang: Lang,
): Promise<Record<string, HoroscopeFile>> {
  const cacheKey = `${period}:${lang}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.files;

  const files: Record<string, HoroscopeFile> = { ...BUNDLED[period][lang] };
  if (Object.keys(BUNDLED.daily.el).length === 0) {
    for (const [filePath, mod] of Object.entries(await diskFiles())) {
      if (filePath.endsWith(`.${lang}.json`) && filePath.includes(`/${FOLDER[period]}/`)) {
        files[mod.key] = mod;
      }
    }
  }
  const client = getClient();
  if (client) {

    try {
      const { data, error } = await client
        .from("horoscopes")
        .select("period, key, lang, signs, generated_at")
        .eq("period", period)
        .eq("lang", lang)
        .order("key", { ascending: false })
        .limit(500);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) {
        files[row.key] = {
          period,
          lang,
          key: row.key,
          generatedAt: row.generated_at,
          signs: (row.signs ?? []) as unknown as Horoscope[],
        };
      }
    } catch (err) {
      console.error(`[horoscopes] database read failed (${cacheKey}):`, err);
    }
  }

  cache.set(cacheKey, { at: Date.now(), files });
  return files;
}

/** Drops the memo so a freshly generated file shows up immediately. */
export function invalidateHoroscopeCache(): void {
  cache.clear();
}

/** All available keys for a period/language, newest first. */
export async function listKeys(period: HoroscopePeriod, lang: Lang): Promise<string[]> {
  return Object.keys(await archiveFor(period, lang)).sort().reverse();
}

/**
 * The requested file, or — when it does not exist — the most recent available
 * one. Never generates anything: pure read.
 */
export async function loadFile(
  period: HoroscopePeriod,
  lang: Lang,
  key?: string,
): Promise<HoroscopeFile | null> {
  const byKey = await archiveFor(period, lang);
  if (key && byKey[key]) return byKey[key];
  const keys = Object.keys(byKey).sort().reverse();
  const latest = key ? (keys.find((k) => k <= key) ?? keys[0]) : keys[0];
  return latest ? (byKey[latest] ?? null) : null;
}
