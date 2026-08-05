import { Link } from "@tanstack/react-router";

import { useLang } from "@/hooks/use-lang";
import { dict } from "@/lib/astro/i18n";

export function SiteHeader() {
  const [lang, setLang] = useLang();
  const t = dict(lang).auth;

  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
          My Zodiac Maps
        </Link>

        <nav className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            {(["el", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
                  lang === code ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <Link
            to="/my-charts"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t.myCharts}
          </Link>
        </nav>
      </div>
    </header>
  );
}
