import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { sitePageHead } from "@/lib/site/head";

export const Route = createFileRoute("/en/contact")({
  head: () => sitePageHead("contact", "en"),
  component: () => <StaticPage lang="en" pageKey="contact" />,
});
