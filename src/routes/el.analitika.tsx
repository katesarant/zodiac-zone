import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const Route = createFileRoute("/el/analitika")({
  head: () => ({
    meta: [
      { title: "Στατιστικά — myzodiacmaps" },
      { name: "description", content: "Ιδιωτικός πίνακας στατιστικών του myzodiacmaps.gr." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Στατιστικά — myzodiacmaps" },
      { property: "og:description", content: "Ιδιωτικός πίνακας στατιστικών." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AnalyticsDashboard lang="el" />,
});
