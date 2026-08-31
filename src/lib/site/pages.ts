import type { Lang } from "@/lib/astro/types";
import { SITE_URL } from "@/lib/horoscope/signs";

export type SitePageKey = "privacy" | "terms" | "about" | "contact";

/** URL slug per language for the static/legal pages. */
export const SITE_PAGE_SLUGS: Record<SitePageKey, Record<Lang, string>> = {
  privacy: { el: "politiki-aporritou", en: "privacy" },
  terms: { el: "oroi-chrisis", en: "terms" },
  about: { el: "schetika", en: "about" },
  contact: { el: "epikoinonia", en: "contact" },
};

export function sitePagePath(key: SitePageKey, lang: Lang): string {
  return `/${lang}/${SITE_PAGE_SLUGS[key][lang]}`;
}

export function sitePageUrls(): string[] {
  const out: string[] = [];
  for (const key of Object.keys(SITE_PAGE_SLUGS) as SitePageKey[]) {
    for (const lang of ["el", "en"] as const) out.push(`${SITE_URL}${sitePagePath(key, lang)}`);
  }
  return out;
}
