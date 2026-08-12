import { createFileRoute, notFound } from "@tanstack/react-router";

import { ReadingPage } from "@/components/horoscope/ReadingPage";
import { signLandingHead } from "@/lib/horoscope/head";
import { getReadingFn } from "@/lib/horoscope/horoscope.functions";
import { signIndexFromSlug } from "@/lib/horoscope/signs";

const LANG = "el" as const;

export const Route = createFileRoute("/el/zodia/$sign/")({
  loader: async ({ params }) => {
    const signIndex = signIndexFromSlug(params.sign, LANG);
    if (signIndex < 0) throw notFound();
    const res = await getReadingFn({ data: { lang: LANG, period: "daily", signIndex } });
    return { signIndex, ...res };
  },
  head: ({ loaderData }) =>
    loaderData
      ? signLandingHead(LANG, loaderData.signIndex, loaderData.key)
      : { meta: [{ title: "MyZodiacMaps" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return (
    <ReadingPage
      lang={LANG}
      signIndex={d.signIndex}
      period="daily"
      dataKey={d.key}
      requestedKey={d.requestedKey}
      isFallback={d.isFallback}
      generatedAt={d.generatedAt}
      reading={d.reading}
      showPeriodLinks
    />
  );
}
