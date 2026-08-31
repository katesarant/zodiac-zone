import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { sitePageHead } from "@/lib/site/head";

export const Route = createFileRoute("/el/politiki-aporritou")({
  head: () => sitePageHead("privacy", "el"),
  component: () => <StaticPage lang="el" pageKey="privacy" />,
});
