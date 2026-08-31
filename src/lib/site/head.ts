import type { Lang } from "@/lib/astro/types";
import { dict } from "@/lib/astro/i18n";
import { SITE_URL } from "@/lib/horoscope/signs";
import { sitePagePath, type SitePageKey } from "./pages";

/** head() for the static/legal pages: unique title/description + canonical + hreflang. */
export function sitePageHead(key: SitePageKey, lang: Lang) {
  const page = dict(lang).legal[key];
  const title = `${page.title} | MyZodiacMaps`;
  const description = page.description;
  const elPath = sitePagePath(key, "el");
  const enPath = sitePagePath(key, "en");
  const current = lang === "el" ? elPath : enPath;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}${current}` },
      { rel: "alternate", hrefLang: "el", href: `${SITE_URL}${elPath}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE_URL}${enPath}` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${elPath}` },
    ],
  };
}
