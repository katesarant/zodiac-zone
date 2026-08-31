import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://myzodiacmaps.gr";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/**
 * Scheduled watcher: compares the live build stamp with the last recorded one
 * and, on a new publish, records it and creates a 15-minute Google Calendar event.
 */
export const Route = createFileRoute("/api/public/publish-watch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["PUBLISH_WATCH_SECRET"];
        if (!expected) return json({ error: "PUBLISH_WATCH_SECRET not configured" }, 500);

        const provided = request.headers.get("x-publish-watch-secret") ?? "";
        if (!timingSafeEqual(provided, expected)) {
          return json({ error: "Unauthorized" }, 401);
        }

        // 1. Read the live build stamp.
        const infoRes = await fetch(`${SITE_URL}/api/public/build-info`, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!infoRes.ok) {
          const body = await infoRes.text();
          console.error(`[publish-watch] build-info failed [${infoRes.status}]: ${body}`);
          return json({ error: "build-info unavailable", status: infoRes.status }, 502);
        }
        const { buildStamp } = (await infoRes.json()) as { buildStamp?: string };
        if (!buildStamp || buildStamp === "dev") {
          return json({ skipped: "no build stamp" });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 2. Record it — the unique constraint makes this idempotent.
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("publish_events")
          .insert({ build_stamp: buildStamp })
          .select("id")
          .maybeSingle();

        if (insertError) {
          // 23505 = already recorded, nothing new was published.
          if (insertError.code === "23505") return json({ changed: false, buildStamp });
          console.error(`[publish-watch] insert failed: ${insertError.message}`);
          return json({ error: insertError.message }, 500);
        }

        // 3. Create the calendar event.
        const lovableKey = process.env["LOVABLE_API_KEY"];
        const connectionKey = process.env["GOOGLE_CALENDAR_API_KEY"];
        if (!lovableKey || !connectionKey) {
          return json({ changed: true, buildStamp, calendar: "not configured" }, 500);
        }

        const start = new Date();
        const end = new Date(start.getTime() + 15 * 60 * 1000);
        const calRes = await fetch(`${GATEWAY_URL}/calendar/v3/calendars/primary/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": connectionKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: "MyZodiacMaps — νέα δημοσίευση",
            description: `Νέα έκδοση του site δημοσιεύτηκε.\nBuild: ${buildStamp}\n${SITE_URL}`,
            start: { dateTime: start.toISOString(), timeZone: "Europe/Athens" },
            end: { dateTime: end.toISOString(), timeZone: "Europe/Athens" },
          }),
        });

        if (!calRes.ok) {
          const body = await calRes.text();
          console.error(`[publish-watch] calendar failed [${calRes.status}]: ${body}`);
          return json({ changed: true, buildStamp, calendarStatus: calRes.status, body }, 502);
        }

        const event = (await calRes.json()) as { id?: string; htmlLink?: string };
        if (inserted?.id && event.id) {
          await supabaseAdmin
            .from("publish_events")
            .update({ calendar_event_id: event.id })
            .eq("id", inserted.id);
        }

        return json({ changed: true, buildStamp, eventId: event.id ?? null });
      },
    },
  },
});
