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
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://myzodiacmaps.gr/en" },
      { rel: "alternate", hrefLang: "el", href: "https://myzodiacmaps.gr/el" },
      { rel: "alternate", hrefLang: "en", href: "https://myzodiacmaps.gr/en" },
    ],
  }),
  component: () => <StudioPage initialLang="en" />,
});
