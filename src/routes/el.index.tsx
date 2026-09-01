import { createFileRoute } from "@tanstack/react-router";

import { StudioPage } from "@/components/astro/StudioPage";

export const Route = createFileRoute("/el/")({
  head: () => ({
    meta: [
      { title: "Αστρολογικός Χάρτης & Ερμηνεία — MyZodiacMaps" },
      {
        name: "description",
        content:
          "Υπολόγισε τον γενέθλιο χάρτη σου και δες ψυχολογική ερμηνεία για πλανήτες, όψεις και σύνθεση, στα ελληνικά.",
      },
      { property: "og:title", content: "Αστρολογικός Χάρτης & Ερμηνεία — MyZodiacMaps" },
      {
        property: "og:description",
        content: "Γενέθλιος χάρτης, όψεις και σύνθεση με καθαρή, ψυχολογική ερμηνεία στα ελληνικά.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://myzodiacmaps.gr/el" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://myzodiacmaps.gr/el" },
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
          url: "https://myzodiacmaps.gr/el",
          applicationCategory: "LifestyleApplication",
          applicationSubCategory: "Astrology",
          operatingSystem: "Web",
          inLanguage: ["el", "en"],
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          description:
            "Υπολογισμός γενέθλιου χάρτη και ψυχολογική ερμηνεία για πλανήτες, όψεις και σύνθεση.",
        }),
      },
    ],
  }),
  component: () => <StudioPage initialLang="el" />,
});
