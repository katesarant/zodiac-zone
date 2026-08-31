import type { Horoscope, HoroscopePeriod, Lang } from "@/lib/astro/types";

export interface HoroscopeFile {
  period: HoroscopePeriod;
  key: string;
  lang: Lang;
  generatedAt: string;
  signs: Horoscope[];
}

/**
 * The archive is bundled at build time. The production runtime is an edge
 * worker with no real filesystem, so reading `data/horoscopes` from disk
 * returns nothing there — the JSON must be part of the bundle instead.
 * Plain node/bun scripts have no `import.meta.glob`, so they read from disk.
 */
async function readFromDisk(): Promise<Record<string, HoroscopeFile>> {
  const out: Record<string, HoroscopeFile> = {};
  const self = import.meta.url;
  if (typeof self !== "string" || !self.startsWith("file:")) return out;
  const [{ readdirSync, readFileSync, existsSync }, path, url] = await Promise.all([
    import("node:fs"),
    import("node:path"),
    import("node:url"),
  ]);
  const here = path.dirname(url.fileURLToPath(self));
  const root = path.resolve(here, "../../../data/horoscopes");
  if (!existsSync(root)) return out;
  for (const folder of readdirSync(root)) {
    const dir = path.join(root, folder);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const full = path.join(dir, file);
      out[`/horoscopes/${folder}/${file}`] = JSON.parse(readFileSync(full, "utf8"));
    }
  }
  return out;
}

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

const bundled = readBundled();
const MODULES: Record<string, HoroscopeFile> =
  Object.keys(bundled).length > 0 ? bundled : await readFromDisk();



const FOLDER: Record<HoroscopePeriod, string> = {
  daily: "daily",
  month: "monthly",
  year: "yearly",
};

/** period -> lang -> key -> file */
const ARCHIVE: Record<HoroscopePeriod, Record<Lang, Record<string, HoroscopeFile>>> = {
  daily: { el: {}, en: {} },
  month: { el: {}, en: {} },
  year: { el: {}, en: {} },
};

for (const [filePath, mod] of Object.entries(MODULES)) {
  const match = /\/horoscopes\/(daily|monthly|yearly)\/(.+)\.(el|en)\.json$/.exec(filePath);
  if (!match || !mod) continue;
  const [, folder, key, lang] = match as unknown as [string, string, string, Lang];
  const period = (Object.keys(FOLDER) as HoroscopePeriod[]).find((p) => FOLDER[p] === folder);
  if (!period) continue;
  ARCHIVE[period][lang][key] = mod;
}

/** All available keys for a period/language, newest first. */
export async function listKeys(period: HoroscopePeriod, lang: Lang): Promise<string[]> {
  return Object.keys(ARCHIVE[period][lang]).sort().reverse();
}

/**
 * The requested file, or — when it does not exist — the most recent available
 * one. Never generates anything: pure static read.
 */
export async function loadFile(
  period: HoroscopePeriod,
  lang: Lang,
  key?: string,
): Promise<HoroscopeFile | null> {
  const byKey = ARCHIVE[period][lang];
  if (key && byKey[key]) return byKey[key];
  const keys = await listKeys(period, lang);
  const latest = key ? (keys.find((k) => k <= key) ?? keys[0]) : keys[0];
  return latest ? (byKey[latest] ?? null) : null;
}
