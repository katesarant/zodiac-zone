import { SIGN_SLUGS, SITE_URL } from "./signs";
import { sitePageUrls } from "@/lib/site/pages";
import { isValidKey } from "./dates";


export interface SitemapEntry {
  loc: string;
}

export interface ArchiveKeys {
  daily: string[];
  month: string[];
  year: string[];
}

const SECTIONS = [
  { lang: "el", section: "zodia", periods: ["simera", "minas", "etos"] },
  { lang: "en", section: "zodiac", periods: ["today", "month", "year"] },
] as const;

/** Pure: builds every sitemap URL from the available archive keys. */
export function buildSitemapUrls(keys: Record<"el" | "en", ArchiveKeys>): string[] {
  const urls: string[] = [
    `${SITE_URL}/el`,
    `${SITE_URL}/en`,
    `${SITE_URL}/el/zodia`,
    `${SITE_URL}/en/zodiac`,
    ...sitePageUrls(),
  ];


  for (const { lang, section, periods } of SECTIONS) {
    const k = keys[lang];
    const archiveKeys = [...k.daily.slice(0, 400), ...k.month, ...k.year].filter(isValidKey);
    for (const slug of SIGN_SLUGS[lang]) {
      urls.push(`${SITE_URL}/${lang}/${section}/${slug}`);
      for (const p of periods) urls.push(`${SITE_URL}/${lang}/${section}/${slug}/${p}`);
      for (const key of archiveKeys) urls.push(`${SITE_URL}/${lang}/${section}/${slug}/${key}`);
    }
  }

  return Array.from(new Set(urls));
}

export function sitemapXml(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
}

/** Reads the archive directory and returns all keys per language. */
export async function collectArchiveKeys(): Promise<Record<"el" | "en", ArchiveKeys>> {
  const { listKeys } = await import("./files.server");
  const out = {} as Record<"el" | "en", ArchiveKeys>;
  for (const lang of ["el", "en"] as const) {
    const [daily, month, year] = await Promise.all([
      listKeys("daily", lang),
      listKeys("month", lang),
      listKeys("year", lang),
    ]);
    out[lang] = { daily, month, year };
  }
  return out;
}
