import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/en/birth-chart-calculator")({
  head: () => guideHead("calculator", "en"),
  component: () => <GuidePage lang="en" guideKey="calculator" />,
});
