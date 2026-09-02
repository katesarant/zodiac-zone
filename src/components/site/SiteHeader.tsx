import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { useLang } from "@/hooks/use-lang";
import { dict } from "@/lib/astro/i18n";
import { Logo } from "./Logo";
import { PathLink } from "@/components/horoscope/PathLink";
import { sitePagePath } from "@/lib/site/pages";
import { guide, guidePath } from "@/lib/site/guides";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routeLang = pathname.startsWith("/en") ? "en" : pathname.startsWith("/el") ? "el" : undefined;
  const [lang, setLang] = useLang(routeLang);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const t = dict(lang).auth;
  const z = dict(lang).zodiac;
  const s = dict(lang).site;
  const zodiacHref = lang === "en" ? "/en/zodiac" : "/el/zodia";

  const menuLinks = [
    { href: `/${lang}`, label: s.nav.home },
    { href: zodiacHref, label: s.nav.forecasts },
    { href: guidePath("rising", lang), label: guide("rising", lang).title },
    { href: guidePath("readChart", lang), label: guide("readChart", lang).title },
    { href: sitePagePath("about", lang), label: s.nav.about },
    { href: sitePagePath("contact", lang), label: s.nav.contact },
    { href: sitePagePath("privacy", lang), label: s.nav.privacy },
    { href: sitePagePath("terms", lang), label: s.nav.terms },
  ];

  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="inline-flex shrink-0 items-baseline gap-[2px] font-display text-base font-semibold tracking-tight whitespace-nowrap text-foreground sm:text-lg"
          aria-label="MyZodiacMaps home"
        >
          <Logo className="h-5 w-5 shrink-0 translate-y-[3px] sm:h-6 sm:w-6 sm:translate-y-[4px]" />
          <span>My Zodiac Maps</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-2 pr-[5px]">
          <PathLink
            href={zodiacHref}
            className="hidden items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
          >
            {z.nav}
          </PathLink>

          <Link
            to="/my-charts"
            className="hidden items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:inline-flex"
          >
            {t.myCharts}
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
              aria-label={lang === "en" ? "Open menu" : "Άνοιγμα μενού"}
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-xs">
              <SheetHeader>
                <SheetTitle className="font-display">My Zodiac Maps</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {menuLinks.map((l) => (
                  <PathLink
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 font-body text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {l.label}
                  </PathLink>
                ))}
                <Link
                  to="/my-charts"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 font-body text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {t.myCharts}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex shrink-0 items-center rounded-lg border border-border p-0.5">
            {(["el", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLang(code);
                  if (routeLang && routeLang !== code) {
                    void navigate({ to: code === "en" ? "/en" : "/el", replace: true });
                  }
                }}
                className={`rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors ${
                  lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
