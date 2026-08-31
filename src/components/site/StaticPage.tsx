import type { Lang } from "@/lib/astro/types";
import { dict } from "@/lib/astro/i18n";
import type { SitePageKey } from "@/lib/site/pages";

/** Shared layout for the legal / about / contact pages. */
export function StaticPage({ lang, pageKey }: { lang: Lang; pageKey: SitePageKey }) {
  const t = dict(lang);
  const page = t.legal[pageKey];
  const email = t.site.contactEmail;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{page.title}</h1>
      <p className="mt-2 max-w-[62ch] font-body text-sm text-muted-foreground">{page.description}</p>
      <p className="mt-1 font-body text-xs text-muted-foreground">{t.site.updated}</p>

      <div className="mt-8 space-y-7">
        {page.sections.map((section) => (
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

      {pageKey === "contact" ? (
        <div className="panel mt-7 p-5 sm:p-6">
          <p className="max-w-[62ch] font-body text-sm leading-relaxed text-foreground/90">
            {t.site.contactIntro}
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-body text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.site.contactCta}
          </a>
          <p className="mt-3 font-body text-xs text-muted-foreground">{email}</p>
        </div>
      ) : null}

      <p className="mt-10 font-body text-xs text-muted-foreground">{t.site.disclaimer}</p>
    </main>
  );
}
