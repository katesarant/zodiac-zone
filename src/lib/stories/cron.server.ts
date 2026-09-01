export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

/**
 * Story endpoints reuse the horoscope generator's shared secret so the whole
 * nightly chain is driven by one token.
 */
export async function requireCronSecret(admin: Admin, request: Request): Promise<Response | null> {
  const { data: config } = await admin.from("horoscope_cron_config").select("token").maybeSingle();
  const expected = config?.token;
  if (!expected) return json({ error: "generator not configured" }, 500);

  const provided = request.headers.get("x-horoscope-cron-secret") ?? "";
  if (!timingSafeEqual(provided, expected)) return json({ error: "Unauthorized" }, 401);
  return null;
}

/** Today's calendar date in Europe/Athens, independent of the host timezone. */
export function athensToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
