import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const Route = createFileRoute("/en/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — myzodiacmaps" },
      { name: "description", content: "Private analytics dashboard for myzodiacmaps.gr." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Analytics — myzodiacmaps" },
      { property: "og:description", content: "Private analytics dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AnalyticsDashboard lang="en" />,
});
