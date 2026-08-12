import { createFileRoute } from "@tanstack/react-router";

import { SignsIndexPage } from "@/components/horoscope/SignsIndexPage";
import { zodiacIndexHead } from "@/lib/horoscope/head";
import { getIndexFn } from "@/lib/horoscope/horoscope.functions";

const LANG = "el" as const;

export const Route = createFileRoute("/el/zodia/")({
  loader: async () => getIndexFn({ data: { lang: LANG } }),
  head: () => zodiacIndexHead(LANG),
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return <SignsIndexPage lang={LANG} dataKey={d.key} />;
}
