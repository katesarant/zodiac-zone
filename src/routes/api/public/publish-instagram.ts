import { createFileRoute } from "@tanstack/react-router";

import { athensToday, json, requireCronSecret } from "@/lib/stories/cron.server";

const GRAPH = "https://graph.facebook.com/v21.0";

async function graphPost(path: string, params: Record<string, string>) {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Instagram API [${res.status}]: ${text}`);
  return JSON.parse(text) as { id?: string };
}

/**
 * Scheduled step 2: publishes the rendered stories that are still pending for
 * the day. Each sign is tracked separately so a single failure can be retried.
 */
export const Route = createFileRoute("/api/public/publish-instagram")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const denied = await requireCronSecret(supabaseAdmin, request);
        if (denied) return denied;

        let body: { date?: string; lang?: "el" | "en" } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          body = {};
        }
        const day = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : athensToday();
        const lang = body.lang === "en" ? "en" : "el";

        const { data: config } = await supabaseAdmin
          .from("instagram_config")
          .select("ig_user_id, access_token, enabled")
          .maybeSingle();

        if (!config?.enabled) return json({ ok: true, skipped: "instagram disabled", day });
        if (!config.ig_user_id || !config.access_token) {
          return json({ error: "instagram account not configured" }, 500);
        }

        const { data: queue, error } = await supabaseAdmin
          .from("instagram_posts")
          .select("id, sign, image_url, status")
          .eq("day", day)
          .eq("lang", lang)
          .neq("status", "published");
        if (error) return json({ error: error.message }, 500);
        if (!queue || queue.length === 0) return json({ ok: true, day, published: 0 });

        let published = 0;
        const failures: string[] = [];

        for (const item of queue) {
          if (!item.image_url) continue;
          try {
            const container = await graphPost(`${config.ig_user_id}/media`, {
              image_url: item.image_url,
              media_type: "STORIES",
              access_token: config.access_token,
            });
            if (!container.id) throw new Error("no creation id returned");

            const result = await graphPost(`${config.ig_user_id}/media_publish`, {
              creation_id: container.id,
              access_token: config.access_token,
            });

            await supabaseAdmin
              .from("instagram_posts")
              .update({
                status: "published",
                media_id: result.id ?? null,
                error: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);
            published++;
          } catch (err) {
            console.error(`[instagram] ${day} ${item.sign} failed: ${String(err)}`);
            failures.push(item.sign);
            await supabaseAdmin
              .from("instagram_posts")
              .update({
                status: "failed",
                error: String(err).slice(0, 500),
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.id);
          }
          // Small gap so the feed does not receive 12 stories in one burst.
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return json({ ok: failures.length === 0, day, published, failed: failures });
      },
    },
  },
});
