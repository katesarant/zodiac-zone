import { createFileRoute } from "@tanstack/react-router";

import { GuidePage } from "@/components/site/GuidePage";
import { guideHead } from "@/lib/site/guides";

export const Route = createFileRoute("/el/se-ti-zodio-einai-i-selini-mou")({
  head: () => guideHead("moon", "el"),
  component: () => <GuidePage lang="el" guideKey="moon" />,
});
