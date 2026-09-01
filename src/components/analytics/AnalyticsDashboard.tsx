import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAnalytics, type AnalyticsSnapshot } from "@/lib/analytics/analytics.functions";
import type { Lang } from "@/lib/astro/types";

const COPY = {
  el: {
    title: "Στατιστικά ιστότοπου",
    intro: "Ιδιωτικός πίνακας με επισκεψιμότητα, χάρτες και δημοσιεύσεις Instagram.",
    password: "Κωδικός",
    enter: "Είσοδος",
    wrong: "Λάθος κωδικός.",
    today: "Σήμερα",
    last7: "7 ημέρες",
    last30: "30 ημέρες",
    daily: "Επισκέψεις ανά ημέρα",
    paths: "Δημοφιλείς σελίδες",
    refs: "Πηγές επισκεψιμότητας",
    langs: "Γλώσσα",
    charts: "Γενέθλιοι χάρτες",
    chartsTotal: "Σύνολο",
    charts30: "Τελευταίες 30 ημέρες",
    instagram: "Instagram stories",
    published: "δημοσιεύτηκαν",
    failed: "απέτυχαν",
    pending: "σε αναμονή",
    horoscopes: "Τελευταίες προβλέψεις",
    none: "Καμία εγγραφή ακόμη.",
    views: "επισκέψεις",
  },
  en: {
    title: "Site analytics",
    intro: "Private dashboard for traffic, charts and Instagram publishing.",
    password: "Password",
    enter: "Enter",
    wrong: "Wrong password.",
    today: "Today",
    last7: "7 days",
    last30: "30 days",
    daily: "Views per day",
    paths: "Top pages",
    refs: "Traffic sources",
    langs: "Language",
    charts: "Birth charts",
    chartsTotal: "Total",
    charts30: "Last 30 days",
    instagram: "Instagram stories",
    published: "published",
    failed: "failed",
    pending: "pending",
    horoscopes: "Latest readings",
    none: "No data yet.",
    views: "views",
  },
} as const;

function Bars({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-muted-foreground">—</p>;
  return (
    <ul className="space-y-2" aria-label={label}>
      {data.map((row) => (
        <li key={row.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm">{row.name}</p>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsDashboard({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);

  const login = useMutation({
    mutationFn: async (value: string) => getAnalytics({ data: { password: value } }),
    onSuccess: (result) => setData(result),
  });

  if (!data) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.intro}</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate(password);
          }}
        >
          <Input
            type="password"
            value={password}
            autoComplete="current-password"
            placeholder={t.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={login.isPending || !password}>
            {t.enter}
          </Button>
          {login.isError && <p className="text-sm text-destructive">{t.wrong}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t.title}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: t.today, value: data.totals.today },
          { label: t.last7, value: data.totals.last7 },
          { label: t.last30, value: data.totals.last30 },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.daily}</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars
              label={t.daily}
              data={data.daily.slice(-14).map((d) => ({ name: d.day, value: d.views }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.paths}</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars
              label={t.paths}
              data={data.topPaths.map((p) => ({ name: p.path, value: p.views }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.refs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars
              label={t.refs}
              data={data.topReferrers.map((r) => ({ name: r.host, value: r.views }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.langs}</CardTitle>
          </CardHeader>
          <CardContent>
            <Bars
              label={t.langs}
              data={data.langs.map((l) => ({ name: l.lang.toUpperCase(), value: l.views }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.charts}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <p className="text-sm text-muted-foreground">{t.chartsTotal}</p>
              <p className="text-2xl font-semibold tabular-nums">{data.charts.total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.charts30}</p>
              <p className="text-2xl font-semibold tabular-nums">{data.charts.last30}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.instagram}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.instagram.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.none}</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {data.instagram.map((row) => (
                  <li key={row.day} className="flex justify-between gap-3">
                    <span className="tabular-nums">{row.day}</span>
                    <span className="text-muted-foreground">
                      {row.published} {t.published} · {row.pending} {t.pending} · {row.failed}{" "}
                      {t.failed}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t.horoscopes}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {data.horoscopes.map((h) => (
              <li key={`${h.period}-${h.lang}-${h.key}`} className="flex justify-between gap-3">
                <span>
                  {h.period} · {h.lang.toUpperCase()} · {h.key}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {new Date(h.generatedAt).toLocaleString(lang === "en" ? "en-GB" : "el-GR")}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
