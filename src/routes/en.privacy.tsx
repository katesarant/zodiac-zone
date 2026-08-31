import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { sitePageHead } from "@/lib/site/head";

export const Route = createFileRoute("/en/privacy")({
  head: () => sitePageHead("privacy", "en"),
  component: () => <StaticPage lang="en" pageKey="privacy" />,
});
