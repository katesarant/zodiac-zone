/** Key formats used by the horoscope archive: YYYY, YYYY-MM, YYYY-MM-DD. */
export const YEAR_KEY = /^\d{4}$/;
export const MONTH_KEY = /^\d{4}-\d{2}$/;
export const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidKey(key: string): boolean {
  return YEAR_KEY.test(key) || MONTH_KEY.test(key) || DAY_KEY.test(key);
}

/** ISO timestamp used for datePublished in the Article structured data. */
export function isoForKey(key: string): string {
  if (YEAR_KEY.test(key)) return `${key}-01-01T00:00:00Z`;
  if (MONTH_KEY.test(key)) return `${key}-01T00:00:00Z`;
  return `${key}T00:00:00Z`;
}

/** dateModified: the file's generation timestamp when valid, else the key date. */
export function dateModifiedFor(key: string, generatedAt: string | null): string {
  const published = isoForKey(key);
  if (!generatedAt) return published;
  const t = Date.parse(generatedAt);
  if (Number.isNaN(t)) return published;
  const iso = new Date(t).toISOString();
  return t < Date.parse(published) ? published : iso;
}
