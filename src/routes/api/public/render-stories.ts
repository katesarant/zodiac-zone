import { createFileRoute } from "@tanstack/react-router";

import { athensToday, json, requireCronSecret } from "@/lib/stories/cron.server";

/**
 * Scheduled step 1: renders the 12 daily story images and queues them for
 * Instagram. Safe to re-run — renders and queue rows are upserted.
 */
export const Route = createFileRoute("/api/public/render-stories")({
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

        const { renderDailyStories } = await import("@/lib/stories/stories.server");

        try {
          const stories = await renderDailyStories(supabaseAdmin, day, lang);

          const rows = stories.map((s) => ({
            day,
            sign: s.sign,
            lang,
            status: "pending",
            image_url: s.imageUrl,
            error: null,
            updated_at: new Date().toISOString(),
          }));

          const { error } = await supabaseAdmin
            .from("instagram_posts")
            .upsert(rows, { onConflict: "day,sign,lang", ignoreDuplicates: false });
          if (error) throw new Error(`queue write failed: ${error.message}`);

          return json({ ok: true, day, lang, rendered: stories.length });
        } catch (err) {
          console.error(`[stories] render failed for ${day}: ${String(err)}`);
          return json({ error: String(err), day }, 500);
        }
      },
    },
  },
});
