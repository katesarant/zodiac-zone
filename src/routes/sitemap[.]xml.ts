import { createFileRoute } from "@tanstack/react-router";

import { SIGN_SLUGS, SITE_URL } from "@/lib/horoscope/signs";

/** Static sitemap: pages + all pre-generated horoscope archive days. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listKeys } = await import("@/lib/horoscope/files.server");
        const urls: string[] = [`${SITE_URL}/el`, `${SITE_URL}/en`, `${SITE_URL}/el/zodia`, `${SITE_URL}/en/zodiac`];

        for (const [lang, section, periods] of [
          ["el", "zodia", ["simera", "minas", "etos"]],
          ["en", "zodiac", ["today", "month", "year"]],
        ] as const) {
          const days = await listKeys("daily", lang);
          for (const slug of SIGN_SLUGS[lang]) {
            urls.push(`${SITE_URL}/${lang}/${section}/${slug}`);
            for (const p of periods) urls.push(`${SITE_URL}/${lang}/${section}/${slug}/${p}`);
            for (const day of days.slice(0, 400)) {
              urls.push(`${SITE_URL}/${lang}/${section}/${slug}/${day}`);
            }
          }
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
