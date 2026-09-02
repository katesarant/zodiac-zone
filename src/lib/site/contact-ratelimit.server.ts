import { getRequestHeader } from "@tanstack/react-start/server";

/** Όρια αποστολών ανά πηγή (IP/συσκευή). */
const LIMITS = [
  { windowMs: 60 * 1000, max: 1 },
  { windowMs: 60 * 60 * 1000, max: 3 },
  { windowMs: 24 * 60 * 60 * 1000, max: 8 },
];

function clientIp() {
  const raw =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-real-ip") ??
    getRequestHeader("x-forwarded-for") ??
    "";
  return raw.split(",")[0]?.trim() || "unknown";
}

/** Ανώνυμο, σταθερό hash της πηγής (IP + user agent) — δεν αποθηκεύουμε την IP. */
export async function senderHash(): Promise<string> {
  const salt = process.env["CONTACT_CAPTCHA_SECRET"] ?? "";
  const input = `${clientIp()}|${getRequestHeader("user-agent") ?? ""}|${salt}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

/** Ελέγχει πόσα μηνύματα έχει στείλει η ίδια πηγή στα πρόσφατα χρονικά παράθυρα. */
export async function checkRateLimit(hash: string): Promise<RateLimitResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const longest = Math.max(...LIMITS.map((l) => l.windowMs));
  const since = new Date(Date.now() - longest).toISOString();

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("created_at")
    .eq("sender_hash", hash)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return { allowed: true };

  const times = data.map((r) => new Date(r.created_at as string).getTime());
  const now = Date.now();

  for (const limit of LIMITS) {
    const inWindow = times.filter((t) => now - t < limit.windowMs);
    if (inWindow.length >= limit.max) {
      const oldest = Math.min(...inWindow);
      const retryAfterSec = Math.max(1, Math.ceil((limit.windowMs - (now - oldest)) / 1000));
      return { allowed: false, retryAfterSec };
    }
  }

  return { allowed: true };
}
