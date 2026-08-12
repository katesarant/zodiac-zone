import type { Lang } from "@/lib/astro/types";
import { tSign } from "@/lib/astro/i18n";
import { SIGNS } from "@/lib/astro/engine";
import { SITE_URL, archivePath, formatLongDate, periodPath, signPath, zodiacIndexPath } from "./signs";

function alternates(elPath: string, enPath: string, current: string) {
  return [
    { rel: "canonical", href: `${SITE_URL}${current}` },
    { rel: "alternate", hrefLang: "el", href: `${SITE_URL}${elPath}` },
    { rel: "alternate", hrefLang: "en", href: `${SITE_URL}${enPath}` },
    { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${elPath}` },
  ];
}

function metaFor(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export function zodiacIndexHead(lang: Lang) {
  const title =
    lang === "en" ? "Zodiac horoscopes — MyZodiacMaps" : "Ζώδια — Ημερήσιες προβλέψεις | MyZodiacMaps";
  const description =
    lang === "en"
      ? "Daily, monthly and yearly readings of the sky for all twelve zodiac signs."
      : "Ημερήσια, μηνιαία και ετήσια ανάγνωση του ουρανού για τα δώδεκα ζώδια.";
  return {
    meta: metaFor(title, description),
    links: alternates(zodiacIndexPath("el"), zodiacIndexPath("en"), zodiacIndexPath(lang)),
  };
}

export function readingHead(opts: {
  lang: Lang;
  signIndex: number;
  period: "daily" | "month" | "year";
  key: string | null;
  archiveKey?: string;
}) {
  const { lang, signIndex, period, key } = opts;
  const sign = tSign(SIGNS[signIndex]!, lang);
  const when = key ? formatLongDate(key, lang) : "";
  const suffix =
    period === "daily"
      ? when
      : period === "month"
        ? lang === "en"
          ? `month ${when}`
          : `μήνας ${when}`
        : when;
  const title = `${sign} — ${suffix} | MyZodiacMaps`;
  const description =
    lang === "en"
      ? `What the sky is doing for ${sign}: ${suffix}. A reading of the transits, not a prediction.`
      : `Τι κάνει ο ουρανός για ${sign}: ${suffix}. Ανάγνωση των όψεων, όχι πρόβλεψη.`;

  const elPath = opts.archiveKey
    ? archivePath(signIndex, "el", opts.archiveKey)
    : period === "daily" && opts.period === "daily"
      ? periodPath(signIndex, "el", "daily")
      : periodPath(signIndex, "el", period);
  const enPath = opts.archiveKey
    ? archivePath(signIndex, "en", opts.archiveKey)
    : periodPath(signIndex, "en", period);

  return {
    meta: metaFor(title, description),
    links: alternates(elPath, enPath, lang === "el" ? elPath : enPath),
  };
}

export function signLandingHead(lang: Lang, signIndex: number, key: string | null) {
  const sign = tSign(SIGNS[signIndex]!, lang);
  const when = key ? formatLongDate(key, lang) : "";
  const title =
    lang === "en" ? `${sign} horoscope — ${when} | MyZodiacMaps` : `${sign} σήμερα — ${when} | MyZodiacMaps`;
  const description =
    lang === "en"
      ? `${sign} today, this month and this year — readings of the sky, updated daily.`
      : `${sign} σήμερα, τον μήνα και τη χρονιά — ανάγνωση του ουρανού, με ημερήσια ενημέρωση.`;
  return {
    meta: metaFor(title, description),
    links: alternates(signPath(signIndex, "el"), signPath(signIndex, "en"), signPath(signIndex, lang)),
  };
}
