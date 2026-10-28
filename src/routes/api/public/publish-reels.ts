import { createFileRoute } from "@tanstack/react-router";

import { athensToday, json, requireCronSecret } from "@/lib/stories/cron.server";

const GRAPH = "https://graph.facebook.com/v21.0";

async function graph(method: "GET" | "POST", path: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(method === "GET" ? `${GRAPH}/${path}?${qs}` : `${GRAPH}/${path}`, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: method === "POST" ? qs : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Instagram API [${res.status}]: ${text}`);
  return JSON.parse(text) as { id?: string; status_code?: string };
}

/** Daily: publishes the next due Reel from the queue (one per run). */
export const Route = createFileRoute("/api/public/publish-reels")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const denied = await requireCronSecret(supabaseAdmin, request);
        if (denied) return denied;

        const { data: config } = await supabaseAdmin
          .from("instagram_config")
          .select("ig_user_id, access_token, enabled")
          .maybeSingle();
        if (!config?.enabled) return json({ ok: true, skipped: "instagram disabled" });
        if (!config.ig_user_id || !config.access_token) {
          return json({ error: "instagram account not configured" }, 500);
        }

        const { data: item, error } = await supabaseAdmin
          .from("instagram_reels_queue")
          .select("id, video_url, caption")
          .in("status", ["pending", "failed"])
          .lte("scheduled_for", athensToday())
          .order("scheduled_for")
          .limit(1)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!item) return json({ ok: true, published: 0 });

        try {
          let videoUrl = item.video_url;
          if (!/^https?:\/\//.test(videoUrl)) {
            const { data: signed, error: sErr } = await supabaseAdmin.storage
              .from("reels")
              .createSignedUrl(videoUrl, 60 * 60);
            if (sErr || !signed) throw new Error(`signed url: ${sErr?.message}`);
            videoUrl = signed.signedUrl;
          }
          const container = await graph("POST", `${config.ig_user_id}/media`, {
            media_type: "REELS",
            video_url: videoUrl,
            caption: item.caption,
            access_token: config.access_token,
          });
          if (!container.id) throw new Error("no creation id returned");

          let ready = false;
          for (let i = 0; i < 20 && !ready; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            const s = await graph("GET", container.id, {
              fields: "status_code",
              access_token: config.access_token,
            });
            if (s.status_code === "ERROR") throw new Error("video processing failed");
            ready = s.status_code === "FINISHED";
          }
          if (!ready) throw new Error("video still processing, will retry next run");

          const result = await graph("POST", `${config.ig_user_id}/media_publish`, {
            creation_id: container.id,
            access_token: config.access_token,
          });
          await supabaseAdmin
            .from("instagram_reels_queue")
            .update({
              status: "published",
              ig_media_id: result.id ?? null,
              published_at: new Date().toISOString(),
              error: null,
            })
            .eq("id", item.id);
          return json({ ok: true, published: 1 });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          await supabaseAdmin
            .from("instagram_reels_queue")
            .update({ status: "failed", error: msg })
            .eq("id", item.id);
          return json({ error: msg }, 500);
        }
      },
    },
  },
});
