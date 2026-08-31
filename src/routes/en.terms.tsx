import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { sitePageHead } from "@/lib/site/head";

export const Route = createFileRoute("/en/terms")({
  head: () => sitePageHead("terms", "en"),
  component: () => <StaticPage lang="en" pageKey="terms" />,
});
