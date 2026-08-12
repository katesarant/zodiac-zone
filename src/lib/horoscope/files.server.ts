import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Horoscope, HoroscopePeriod, Lang } from "@/lib/astro/types";

export interface HoroscopeFile {
  period: HoroscopePeriod;
  key: string;
  lang: Lang;
  generatedAt: string;
  signs: Horoscope[];
}

const ROOT = path.resolve(process.cwd(), "data", "horoscopes");
const DIR: Record<HoroscopePeriod, string> = {
  daily: path.join(ROOT, "daily"),
  month: path.join(ROOT, "monthly"),
  year: path.join(ROOT, "yearly"),
};

async function readFileJson(file: string): Promise<HoroscopeFile | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as HoroscopeFile;
  } catch {
    return null;
  }
}

/** All available keys for a period/language, newest first. */
export async function listKeys(period: HoroscopePeriod, lang: Lang): Promise<string[]> {
  try {
    const files = await readdir(DIR[period]);
    return files
      .filter((f) => f.endsWith(`.${lang}.json`))
      .map((f) => f.slice(0, -`.${lang}.json`.length))
      .sort()
      .reverse();
  } catch {
    return [];
  }
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
  if (key) {
    const exact = await readFileJson(path.join(DIR[period], `${key}.${lang}.json`));
    if (exact) return exact;
  }
  const keys = await listKeys(period, lang);
  const latest = key ? (keys.find((k) => k <= key) ?? keys[0]) : keys[0];
  if (!latest) return null;
  return readFileJson(path.join(DIR[period], `${latest}.${lang}.json`));
}
