import { PathLink } from "@/components/horoscope/PathLink";
import { dict } from "@/lib/astro/i18n";
import type { Lang } from "@/lib/astro/types";
import { guide, type GuideKey } from "@/lib/site/guides";

/** Shared layout for the long-form SEO guide pages. */
export function GuidePage({ lang, guideKey }: { lang: Lang; guideKey: GuideKey }) {
  const t = dict(lang);
  const g = guide(guideKey, lang);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <article>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{g.title}</h1>
        <p className="mt-3 max-w-[68ch] font-body text-base leading-relaxed text-foreground/90">{g.intro}</p>

        <div className="mt-8 space-y-7">
          {g.sections.map((section) => (
            <section key={section.h} className="panel p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-primary">{section.h}</h2>
              {section.p.map((paragraph, i) => (
                <p key={i} className="mt-2 max-w-[68ch] font-body text-sm leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section className="panel mt-8 p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-primary">{g.faqTitle}</h2>
          <dl className="mt-3 space-y-4">
            {g.faq.map((f) => (
              <div key={f.q}>
                <dt className="font-body text-sm font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1 max-w-[68ch] font-body text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </article>

      <div className="panel mt-8 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">{g.ctaTitle}</h2>
        <p className="mt-2 max-w-[62ch] font-body text-sm leading-relaxed text-muted-foreground">{g.ctaText}</p>
        <PathLink
          href={g.ctaHref}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-body text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {g.ctaLabel}
        </PathLink>
      </div>

      <p className="mt-10 font-body text-xs text-muted-foreground">{t.site.disclaimer}</p>
    </main>
  );
}
