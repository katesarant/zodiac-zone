import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/el/ti-oroskopo-eho")({
  head: () => guideHead("rising", "el"),
  component: () => <GuidePage lang="el" guideKey="rising" />,
});
