import { createFileRoute, notFound } from "@tanstack/react-router";

import { ReadingPage } from "@/components/horoscope/ReadingPage";
import { readingHead } from "@/lib/horoscope/head";
import { getReadingFn } from "@/lib/horoscope/horoscope.functions";
import { signIndexFromSlug } from "@/lib/horoscope/signs";

const LANG = "en" as const;
const PERIOD = "month" as const;

export const Route = createFileRoute("/en/zodiac/$sign/month")({
  loader: async ({ params }) => {
    const signIndex = signIndexFromSlug(params.sign, LANG);
    if (signIndex < 0) throw notFound();
    const res = await getReadingFn({ data: { lang: LANG, period: PERIOD, signIndex } });
    return { signIndex, ...res };
  },
  head: ({ loaderData }) =>
    loaderData
      ? readingHead({ lang: LANG, signIndex: loaderData.signIndex, period: PERIOD, key: loaderData.key })
      : { meta: [{ title: "MyZodiacMaps" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return (
    <ReadingPage
      lang={LANG}
      signIndex={d.signIndex}
      period={PERIOD}
      dataKey={d.key}
      requestedKey={d.requestedKey}
      isFallback={d.isFallback}
      generatedAt={d.generatedAt}
      reading={d.reading}
    />
  );
}
