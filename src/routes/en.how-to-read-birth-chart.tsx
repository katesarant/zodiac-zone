import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/en/how-to-read-birth-chart")({
  head: () => guideHead("readChart", "en"),
  component: () => <GuidePage lang="en" guideKey="readChart" />,
});
