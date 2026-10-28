import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/en/what-is-my-moon-sign")({
  head: () => guideHead("moon", "en"),
  component: () => <GuidePage lang="en" guideKey="moon" />,
});
