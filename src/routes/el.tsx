import { createFileRoute } from "@tanstack/react-router";

import { StudioPage } from "@/components/astro/StudioPage";

export const Route = createFileRoute("/el")({
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
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://myzodiacmaps.gr/el" },
      { rel: "alternate", hrefLang: "el", href: "https://myzodiacmaps.gr/el" },
      { rel: "alternate", hrefLang: "en", href: "https://myzodiacmaps.gr/en" },
    ],
  }),
  component: () => <StudioPage initialLang="el" />,
});
