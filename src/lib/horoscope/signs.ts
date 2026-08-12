import type { Lang } from "@/lib/astro/types";

/** Zodiac order used everywhere in the app (0 = Κριός). */
export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"] as const;

export const SIGN_SLUGS: Record<Lang, string[]> = {
  el: [
    "krios",
    "tavros",
    "didymoi",
    "karkinos",
    "leon",
    "parthenos",
    "zygos",
    "skorpios",
    "toxotis",
    "aigokeros",
    "ydrochoos",
    "ichthyes",
  ],
  en: [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ],
};

/** URL segments per language: /el/zodia/krios/simera — /en/zodiac/aries/today */
export const SECTION: Record<Lang, string> = { el: "zodia", en: "zodiac" };
export const PERIOD_SLUG: Record<Lang, { daily: string; month: string; year: string }> = {
  el: { daily: "simera", month: "minas", year: "etos" },
  en: { daily: "today", month: "month", year: "year" },
};

export function signIndexFromSlug(slug: string, lang: Lang): number {
  return SIGN_SLUGS[lang].indexOf(slug.toLowerCase());
}

export function signSlug(index: number, lang: Lang): string {
  return SIGN_SLUGS[lang][index] ?? SIGN_SLUGS[lang][0]!;
}

export const SITE_URL = "https://myzodiacmaps.gr";

/** "Τετάρτη 6 Αυγούστου 2026" / "Wednesday 6 August 2026" */
export function formatLongDate(key: string, lang: Lang): string {
  const locale = lang === "en" ? "en-GB" : "el-GR";
  if (/^\d{4}$/.test(key)) return key;
  if (/^\d{4}-\d{2}$/.test(key)) {
    const d = new Date(`${key}-01T12:00:00Z`);
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  }
  const d = new Date(`${key}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function zodiacIndexPath(lang: Lang): string {
  return `/${lang}/${SECTION[lang]}`;
}

export function signPath(index: number, lang: Lang): string {
  return `${zodiacIndexPath(lang)}/${signSlug(index, lang)}`;
}

export function periodPath(index: number, lang: Lang, period: "daily" | "month" | "year"): string {
  return `${signPath(index, lang)}/${PERIOD_SLUG[lang][period]}`;
}

export function archivePath(index: number, lang: Lang, key: string): string {
  return `${signPath(index, lang)}/${key}`;
}
