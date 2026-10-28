import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/el/genethlios-chartis-dorean")({
  head: () => guideHead("calculator", "el"),
  component: () => <GuidePage lang="el" guideKey="calculator" />,
});
