import { createFileRoute, notFound } from "@tanstack/react-router";

import { ReadingPage } from "@/components/horoscope/ReadingPage";
import { readingHead } from "@/lib/horoscope/head";
import { getReadingFn } from "@/lib/horoscope/horoscope.functions";
import { signIndexFromSlug } from "@/lib/horoscope/signs";

const LANG = "en" as const;

export const Route = createFileRoute("/en/zodiac/$sign/$date")({
  loader: async ({ params }) => {
    const signIndex = signIndexFromSlug(params.sign, LANG);
    if (signIndex < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(params.date)) throw notFound();
    const res = await getReadingFn({
      data: { lang: LANG, period: "daily", signIndex, key: params.date },
    });
    return { signIndex, requested: params.date, ...res };
  },
  head: ({ loaderData }) =>
    loaderData
      ? readingHead({
          lang: LANG,
          signIndex: loaderData.signIndex,
          period: "daily",
          key: loaderData.key,
          archiveKey: loaderData.requested,
        })
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
      requestedKey={d.requested}
      isFallback={d.isFallback}
      generatedAt={d.generatedAt}
      reading={d.reading}
    />
  );
}
