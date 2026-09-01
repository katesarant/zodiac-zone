import { createFileRoute } from "@tanstack/react-router";

import { StudioPage } from "@/components/astro/StudioPage";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "Birth Chart & Interpretation — MyZodiacMaps" },
      {
        name: "description",
        content:
          "Calculate your natal chart and read a clear, psychological interpretation of planets, aspects and synthesis in English.",
      },
      { property: "og:title", content: "Birth Chart & Interpretation — MyZodiacMaps" },
      {
        property: "og:description",
        content: "Natal chart, aspects and synthesis with a clear psychological reading in English.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://myzodiacmaps.gr/en" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://myzodiacmaps.gr/en" },
      { rel: "alternate", hrefLang: "el", href: "https://myzodiacmaps.gr/el" },
      { rel: "alternate", hrefLang: "en", href: "https://myzodiacmaps.gr/en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://myzodiacmaps.gr/el" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "MyZodiacMaps",
          url: "https://myzodiacmaps.gr/en",
          applicationCategory: "LifestyleApplication",
          applicationSubCategory: "Astrology",
          operatingSystem: "Web",
          inLanguage: ["el", "en"],
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          description:
            "Natal chart calculation with a clear psychological interpretation of planets, aspects and synthesis.",
        }),
      },
    ],
  }),
  component: () => <StudioPage initialLang="en" />,
});
