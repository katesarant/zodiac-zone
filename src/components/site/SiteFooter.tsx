import { useRouterState } from "@tanstack/react-router";

import { dict } from "@/lib/astro/i18n";
import type { Lang } from "@/lib/astro/types";
import { PathLink } from "@/components/horoscope/PathLink";
import { sitePagePath } from "@/lib/site/pages";
import { guide, guidePath } from "@/lib/site/guides";
import { Logo } from "./Logo";

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang: Lang = pathname.startsWith("/en") ? "en" : "el";
  const t = dict(lang);
  const s = t.site;
  const year = new Date().getUTCFullYear();

  const links = [
    { href: `/${lang}`, label: s.nav.home },
    { href: lang === "en" ? "/en/zodiac" : "/el/zodia", label: s.nav.forecasts },
    { href: guidePath("rising", lang), label: guide("rising", lang).title },
    { href: guidePath("readChart", lang), label: guide("readChart", lang).title },
    { href: sitePagePath("about", lang), label: s.nav.about },
    { href: sitePagePath("contact", lang), label: s.nav.contact },
    { href: sitePagePath("privacy", lang), label: s.nav.privacy },
    { href: sitePagePath("terms", lang), label: s.nav.terms },
  ];

  return (
    <footer className="mt-16 border-t border-border/60 print:hidden">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Logo className="h-5 w-5" />
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            My Zodiac Maps
          </span>
        </div>

        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <PathLink
              key={l.href}
              href={l.href}
              className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </PathLink>
          ))}
        </nav>

        <p className="mt-5 max-w-[70ch] font-body text-xs leading-relaxed text-muted-foreground">
          {s.disclaimer}
        </p>
        <p className="mt-2 font-body text-xs text-muted-foreground">
          © {year} MyZodiacMaps. {s.rights}
        </p>
      </div>
    </footer>
  );
}
