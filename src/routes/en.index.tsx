import { createFileRoute } from "@tanstack/react-router";

import { StudioPage } from "@/components/astro/StudioPage";

export const Route = createFileRoute("/en/")({
  head: () => ({
    meta: [
      { title: "Free Birth Chart Calculator & Natal Chart Reading — MyZodiacMaps" },
      {
        name: "description",
        content:
          "Free birth chart calculator: find your sun, moon and rising sign and get a clear natal chart reading of planets, houses and aspects. No signup.",
      },
      { property: "og:title", content: "Free Birth Chart Calculator & Natal Chart Reading — MyZodiacMaps" },
      {
        property: "og:description",
        content: "Find your sun, moon and rising sign with a free natal chart and a clear psychological reading.",
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
