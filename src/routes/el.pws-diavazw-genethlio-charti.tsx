import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/el/pws-diavazw-genethlio-charti")({
  head: () => guideHead("readChart", "el"),
  component: () => <GuidePage lang="el" guideKey="readChart" />,
});
