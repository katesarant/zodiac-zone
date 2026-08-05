import { Link, createFileRoute } from "@tanstack/react-router";

import { useLang } from "@/hooks/use-lang";
import { dict } from "@/lib/astro/i18n";
import { btnOutline } from "@/lib/ui";

type ChartRow = {
  id: string;
  label: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  is_favorite: boolean;
};

export const Route = createFileRoute("/my-charts")({
  ssr: false,

  head: () => ({
    meta: [
      { title: "Οι χάρτες μου — My Zodiac Maps" },
      { name: "description", content: "Δες και διαχειρίσου τους αποθηκευμένους γενέθλιους χάρτες σου." },
      { property: "og:title", content: "Οι χάρτες μου — My Zodiac Maps" },
      { property: "og:description", content: "Οι αποθηκευμένοι χάρτες σου σε ένα μέρος." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyChartsPage,
});

function MyChartsPage() {
  const [lang] = useLang();
  const t = dict(lang).auth;
  const rows: ChartRow[] = [];


  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t.chartsTitle}</h1>

      <div className="mt-6 space-y-3">
        {rows === null ? (
          <div className="panel h-20 animate-pulse" />
        ) : rows.length === 0 ? (
          <div className="panel p-6">
            <p className="text-sm text-muted-foreground">{t.chartsEmpty}</p>
            <Link to="/" className={`mt-4 ${btnOutline}`}>
              My Zodiac Maps
            </Link>
          </div>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="panel flex items-center justify-between gap-4 p-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{row.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {[row.birth_place, row.birth_date, row.birth_time?.slice(0, 5)].filter(Boolean).join(" · ")}
                </p>
              </div>
              {row.is_favorite ? <span className="text-primary">★</span> : null}
            </article>
          ))
        )}
      </div>
    </main>
  );
}
