import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { sitePageHead } from "@/lib/site/head";

export const Route = createFileRoute("/el/schetika")({
  head: () => sitePageHead("about", "el"),
  component: () => <StaticPage lang="el" pageKey="about" />,
});
