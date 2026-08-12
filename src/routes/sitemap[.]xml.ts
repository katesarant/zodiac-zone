import { createFileRoute } from "@tanstack/react-router";

/** Static sitemap: pages + all pre-generated horoscope archive keys. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { buildSitemapUrls, collectArchiveKeys, sitemapXml } = await import(
          "@/lib/horoscope/sitemap.server"
        );
        const body = sitemapXml(buildSitemapUrls(await collectArchiveKeys()));
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
