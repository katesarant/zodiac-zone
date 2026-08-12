/**
 * Build-time check: the sitemap has no duplicate URLs and every archive entry
 * yields valid datePublished / dateModified values. Run with `bun scripts/check-sitemap.ts`.
 */
import { buildSitemapUrls, collectArchiveKeys } from "../src/lib/horoscope/sitemap.server";
import { dateModifiedFor, isValidKey, isoForKey } from "../src/lib/horoscope/dates";

const errors: string[] = [];

const keys = await collectArchiveKeys();
const urls = buildSitemapUrls(keys);

// 1. duplicates
const seen = new Set<string>();
for (const u of urls) {
  if (seen.has(u)) errors.push(`duplicate URL in sitemap: ${u}`);
  seen.add(u);
}

// 2. dates
let checked = 0;
for (const lang of ["el", "en"] as const) {
  for (const period of ["daily", "month", "year"] as const) {
    for (const key of keys[lang][period]) {
      if (!isValidKey(key)) {
        errors.push(`invalid archive key ${key} (${lang}/${period})`);
        continue;
      }
      const published = isoForKey(key);
      const modified = dateModifiedFor(key, new Date().toISOString());
      if (Number.isNaN(Date.parse(published))) errors.push(`bad datePublished for ${key}`);
      if (Number.isNaN(Date.parse(modified))) errors.push(`bad dateModified for ${key}`);
      if (Date.parse(modified) < Date.parse(published)) {
        errors.push(`dateModified before datePublished for ${key}`);
      }
      checked += 1;
    }
  }
}

if (errors.length) {
  console.error(`sitemap check FAILED (${errors.length} problems)`);
  for (const e of errors.slice(0, 20)) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`sitemap check OK — ${urls.length} unique URLs, ${checked} archive entries validated`);
