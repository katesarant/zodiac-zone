import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { ChartTables, ChartWheel } from "@/components/astro/ChartWheel";
import { ResultView } from "@/components/astro/ResultView";
import { useLang } from "@/hooks/use-lang";
import { dict, tSign } from "@/lib/astro/i18n";
import { generateSynthesisFn } from "@/lib/astro/interpretation.functions";
import type { ChartJson } from "@/lib/astro/types";
import {
  deleteChart as removeChart,
  listCharts,
  listFolders,
  toggleFavorite,
  updateChart,
  type Folder,
  type SavedChart,
} from "@/lib/storage/local-library";
import { btnOutline, field } from "@/lib/ui";


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

type SortKey = "default" | "name" | "birth" | "saved";
type FilterKey = "all" | "favorites";

/** Reads the Sun straight out of the saved chart. Never recomputes. */
function sunOf(chartJson: unknown): { sign: string; degree: number } | null {
  const planets = (chartJson as ChartJson | null)?.planets;
  if (!Array.isArray(planets)) return null;
  const sun = planets.find((p) => p?.name === "Ήλιος" || p?.name === "Sun");
  if (!sun) return null;
  return { sign: sun.sign, degree: sun.degree };
}

function Star({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className="text-lg leading-none transition-opacity hover:opacity-80"
      style={{ color: on ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
    >
      {on ? "★" : "☆"}
    </button>
  );
}

function MyChartsPage() {
  const [lang] = useLang();
  const t = dict(lang).library;
  const tt = dict(lang);

  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [folderId, setFolderId] = useState<string | "all" | "unfiled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reading, setReading] = useState<{
    data: unknown;
    flagged: boolean;
    limited?: boolean;
  } | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const synthesisFn = useServerFn(generateSynthesisFn);


  useEffect(() => {
    setCharts(listCharts());
    setFolders(listFolders());
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = charts.filter((c) => {
      if (filter === "favorites" && !c.isFavorite) return false;
      if (folderId === "unfiled" && c.folderId !== null) return false;
      if (folderId !== "all" && folderId !== "unfiled" && c.folderId !== folderId) return false;
      if (!q) return true;
      return `${c.label} ${c.birthPlace}`.toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.label.localeCompare(b.label, lang === "en" ? "en" : "el");
      if (sort === "birth") return a.birthDate.localeCompare(b.birthDate);
      if (sort === "saved") return b.createdAt.localeCompare(a.createdAt);
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [charts, query, filter, sort, folderId, lang]);

  function onToggleFavorite(id: string) {
    toggleFavorite(id);
    setCharts(listCharts());
  }

  function onRename(chart: SavedChart) {
    const next = window.prompt(t.rename, chart.label);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    updateChart(chart.id, { label: trimmed });
    setCharts(listCharts());
  }

  function onDelete(id: string) {
    if (!window.confirm(t.confirmDelete)) return;
    removeChart(id);
    if (openId === id) setOpenId(null);
    setCharts(listCharts());
  }

  /** Ανοίγει τον χάρτη και τυπώνει μόνο αυτόν (PDF μέσω του browser). */
  function onPdf(id: string) {
    setOpenId(id);
    window.setTimeout(() => window.print(), 120);
  }

  const openChart = rows.find((c) => c.id === openId) ?? null;
  const openChartJson = openChart ? (openChart.chartJson as ChartJson) : null;

  // Ερμηνεία για τον ανοιχτό χάρτη (σερβίρεται από το shared cache όταν υπάρχει).
  useEffect(() => {
    if (!openChartJson) {
      setReading(null);
      setReadingError(null);
      setReadingLoading(false);
      return;
    }
    let active = true;
    setReading(null);
    setReadingError(null);
    setReadingLoading(true);
    synthesisFn({ data: { chart: openChartJson, lang } })
      .then((res) => {
        if (active) setReading(res as { data: unknown; flagged: boolean; limited?: boolean });
      })
      .catch((err: unknown) => {
        if (active) setReadingError(err instanceof Error ? err.message : "unknown_error");
      })
      .finally(() => {
        if (active) setReadingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [openId, lang, openChartJson, synthesisFn]);


  const folderOptions: Array<{ id: string; name: string }> = [
    { id: "all", name: t.all },
    { id: "unfiled", name: t.unfiled },
    ...folders.map((f) => ({ id: f.id, name: f.name })),
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-foreground" data-print-hide>
        {t.title}
      </h1>

      <section className="mt-5" data-print-hide>
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">{t.backupNote}</p>
      </section>




      {charts.length === 0 ? (
        <div className="panel mt-6 p-6">
          <h2 className="font-display text-lg text-foreground">{t.emptyTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.emptyBody}</p>
          <Link to={lang === "en" ? "/en" : "/el"} className={`mt-4 ${btnOutline}`}>
            {t.createFirst}
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          {/* Sidebar / mobile dropdown */}
          <aside className="sm:w-52 sm:shrink-0" data-print-hide>
            <div className="sm:hidden">
              <select className={field} value={folderId} onChange={(e) => setFolderId(e.target.value)}>
                {folderOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <nav className="hidden sm:block">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{t.folders}</p>
              <ul className="space-y-1">
                {folderOptions.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setFolderId(f.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        folderId === f.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                      }`}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center" data-print-hide>
              <input
                type="search"
                className={field}
                value={query}
                placeholder={t.searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex gap-1 rounded-full border border-border bg-card p-1">
                {(["all", "favorites"] as FilterKey[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {f === "all" ? t.all : t.favorites}
                  </button>
                ))}
              </div>
              <select
                className={`${field} sm:w-44`}
                value={sort}
                aria-label={t.sortBy}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="default">{t.sortDefault}</option>
                <option value="name">{t.sortName}</option>
                <option value="birth">{t.sortBirth}</option>
                <option value="saved">{t.sortSaved}</option>
              </select>
            </div>

            {rows.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground" data-print-hide>{t.noResults}</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="mt-5 hidden sm:block" data-print-hide>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                        <th className="py-2 pr-2 font-normal">★</th>
                        <th className="py-2 pr-3 font-normal">{t.colName}</th>
                        <th className="py-2 pr-3 font-normal">{t.colBirthDate}</th>
                        <th className="py-2 pr-3 font-normal">{t.colTime}</th>
                        <th className="py-2 pr-3 font-normal">{t.colPlace}</th>
                        <th className="py-2 pr-3 font-normal">{t.colSun}</th>
                        <th className="py-2 font-normal">{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((c) => {
                        const sun = sunOf(c.chartJson);
                        return (
                          <tr key={c.id} className="border-b border-border/60">
                            <td className="py-3 pr-2">
                              <Star on={c.isFavorite} label={t.favorite} onClick={() => onToggleFavorite(c.id)} />
                            </td>
                            <td className="py-3 pr-3 text-foreground">{c.label}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{c.birthDate}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{c.birthTime}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{c.birthPlace}</td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {sun ? `${tSign(sun.sign, lang)} ${Math.floor(sun.degree)}°` : "—"}
                            </td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-3 text-xs">
                                <button type="button" className="text-primary" onClick={() => setOpenId(c.id)}>
                                  {t.open}
                                </button>
                                <button type="button" className="text-muted-foreground" onClick={() => onRename(c)}>
                                  {t.rename}
                                </button>
                                <button type="button" className="text-muted-foreground" onClick={() => onPdf(c.id)}>
                                  {t.pdfLabel}
                                </button>
                                <button type="button" className="text-destructive" onClick={() => onDelete(c.id)}>
                                  {t.remove}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="mt-5 space-y-3 sm:hidden" data-print-hide>
                  {rows.map((c) => {
                    const sun = sunOf(c.chartJson);
                    return (
                      <article key={c.id} className="panel p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="font-display text-lg text-foreground">{c.label}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[c.birthPlace, c.birthDate, c.birthTime].filter(Boolean).join(" · ")}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t.colSun}: {sun ? `${tSign(sun.sign, lang)} ${Math.floor(sun.degree)}°` : "—"}
                            </p>
                          </div>
                          <Star on={c.isFavorite} label={t.favorite} onClick={() => onToggleFavorite(c.id)} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs">
                          <button type="button" className="text-primary" onClick={() => setOpenId(c.id)}>
                            {t.open}
                          </button>
                          <button type="button" className="text-muted-foreground" onClick={() => onRename(c)}>
                            {t.rename}
                          </button>
                          <button type="button" className="text-muted-foreground" onClick={() => onPdf(c.id)}>
                            {t.pdfLabel}
                          </button>
                          <button type="button" className="text-destructive" onClick={() => onDelete(c.id)}>
                            {t.remove}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {openChart && (
              <section className="panel mt-6 p-6">
                <header className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl text-foreground">{openChart.label}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[openChart.birthPlace, openChart.birthDate, openChart.birthTime].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button type="button" className={btnOutline} onClick={() => setOpenId(null)}>
                    {t.cancel}
                  </button>
                </header>
                <ChartWheel chart={openChart.chartJson as ChartJson} />
                <div className="mt-8">
                  <ChartTables chart={openChart.chartJson as ChartJson} lang={lang} />
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
