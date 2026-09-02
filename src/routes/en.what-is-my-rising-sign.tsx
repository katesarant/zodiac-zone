import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/en/what-is-my-rising-sign")({
  head: () => guideHead("rising", "en"),
  component: () => <GuidePage lang="en" guideKey="rising" />,
});
