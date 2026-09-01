import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trackSchema = z.object({
  path: z.string().min(1).max(300),
  lang: z.enum(["el", "en"]).nullable().optional(),
  referrer: z.string().max(500).optional(),
});

function referrerHost(referrer?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname;
    return host.endsWith("myzodiacmaps.gr") ? null : host;
  } catch {
    return null;
  }
}

/** Records one anonymous page view. No cookies, no identifiers. */
export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((data) => trackSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("page_views").insert({
      path: data.path.slice(0, 300),
      lang: data.lang ?? null,
      referrer_host: referrerHost(data.referrer),
    });
    return { ok: true };
  });

export interface AnalyticsSnapshot {
  totals: { today: number; last7: number; last30: number };
  daily: { day: string; views: number }[];
  topPaths: { path: string; views: number }[];
  topReferrers: { host: string; views: number }[];
  langs: { lang: string; views: number }[];
  charts: { total: number; last30: number };
  instagram: { day: string; published: number; failed: number; pending: number }[];
  horoscopes: { period: string; lang: string; key: string; generatedAt: string }[];
}

const statsSchema = z.object({ password: z.string().min(1).max(200) });

/** Password-gated dashboard data. The password lives in analytics_config. */
export const getAnalytics = createServerFn({ method: "POST" })
  .inputValidator((data) => statsSchema.parse(data))
  .handler(async ({ data }): Promise<AnalyticsSnapshot> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: config } = await supabaseAdmin
      .from("analytics_config")
      .select("password")
      .maybeSingle();
    if (!config?.password || config.password !== data.password) {
      throw new Error("unauthorized");
    }

    const today = new Date().toISOString().slice(0, 10);
    const since30 = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    const since7 = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

    const { data: views } = await supabaseAdmin
      .from("page_views")
      .select("day, path, lang, referrer_host")
      .gte("day", since30)
      .limit(50000);

    const rows = views ?? [];
    const byDay = new Map<string, number>();
    const byPath = new Map<string, number>();
    const byRef = new Map<string, number>();
    const byLang = new Map<string, number>();

    for (const row of rows) {
      byDay.set(row.day, (byDay.get(row.day) ?? 0) + 1);
      byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
      if (row.referrer_host) byRef.set(row.referrer_host, (byRef.get(row.referrer_host) ?? 0) + 1);
      if (row.lang) byLang.set(row.lang, (byLang.get(row.lang) ?? 0) + 1);
    }

    const daily = [...byDay.entries()]
      .map(([day, views]) => ({ day, views }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const sortTop = (map: Map<string, number>, key: "path" | "host") =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, views]) => ({ [key]: name, views })) as never[];

    const { count: chartsTotal } = await supabaseAdmin
      .from("interpretations")
      .select("chart_hash", { count: "exact", head: true });
    const { count: charts30 } = await supabaseAdmin
      .from("interpretations")
      .select("chart_hash", { count: "exact", head: true })
      .gte("created_at", `${since30}T00:00:00Z`);

    const { data: posts } = await supabaseAdmin
      .from("instagram_posts")
      .select("day, status")
      .gte("day", since30);

    const igByDay = new Map<string, { published: number; failed: number; pending: number }>();
    for (const post of posts ?? []) {
      const entry = igByDay.get(post.day) ?? { published: 0, failed: 0, pending: 0 };
      if (post.status === "published") entry.published++;
      else if (post.status === "failed") entry.failed++;
      else entry.pending++;
      igByDay.set(post.day, entry);
    }

    const { data: horoscopes } = await supabaseAdmin
      .from("horoscopes")
      .select("period, lang, key, generated_at")
      .order("generated_at", { ascending: false })
      .limit(8);

    return {
      totals: {
        today: byDay.get(today) ?? 0,
        last7: daily.filter((d) => d.day >= since7).reduce((sum, d) => sum + d.views, 0),
        last30: rows.length,
      },
      daily,
      topPaths: sortTop(byPath, "path"),
      topReferrers: sortTop(byRef, "host"),
      langs: [...byLang.entries()].map(([lang, views]) => ({ lang, views })),
      charts: { total: chartsTotal ?? 0, last30: charts30 ?? 0 },
      instagram: [...igByDay.entries()]
        .map(([day, v]) => ({ day, ...v }))
        .sort((a, b) => b.day.localeCompare(a.day))
        .slice(0, 14),
      horoscopes: (horoscopes ?? []).map((h) => ({
        period: h.period,
        lang: h.lang,
        key: h.key,
        generatedAt: h.generated_at,
      })),
    };
  });
