import type { ChartJson, Lang } from "./types";

/**
 * Cache key derived from the chart CONTENT only.
 * The `chartHash` sent by the browser is deliberately ignored — a forged value
 * could poison the entry other users read.
 */
export async function contentKey(chart: ChartJson): Promise<string> {
  const canonical = JSON.stringify({
    h: chart.houseSystem,
    asc: [chart.angles.asc.sign, round(chart.angles.asc.degree)],
    mc: [chart.angles.mc.sign, round(chart.angles.mc.degree)],
    p: [...chart.planets]
      .map((p) => [p.name, p.sign, round(p.degree), p.house, p.retrograde ? 1 : 0])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  });

  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Reads a cached interpretation. Never throws — a broken cache must not break generation. */
export async function readCache<T>(key: string, lang: Lang, kind: string): Promise<T | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("interpretations")
      .select("content")
      .eq("chart_hash", key)
      .eq("lang", lang)
      .eq("kind", kind)
      .maybeSingle();
    if (error || !data) return null;
    return data.content as T;
  } catch {
    return null;
  }
}

/** Stores a clean interpretation. Never throws. */
export async function writeCache(
  key: string,
  lang: Lang,
  kind: string,
  content: unknown,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("interpretations")
      .upsert(
        { chart_hash: key, lang, kind, content: content as never },
        { onConflict: "chart_hash,lang,kind" },
      );
  } catch {
    /* fail soft */
  }
}
