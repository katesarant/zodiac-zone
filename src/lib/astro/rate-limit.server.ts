import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Απλός in-memory fixed-window μετρητής (speed bump, όχι κύρια προστασία).
 * Δεν αποθηκεύεται και δεν καταγράφεται τίποτα: το IP κρατιέται μόνο ως
 * hash στη μνήμη του worker και χάνεται σε κάθε restart.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const buckets = new Map<string, { count: number; resetAt: number }>();

async function clientKey(): Promise<string> {
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** true όταν το αίτημα επιτρέπεται. */
export async function allowGeneration(): Promise<boolean> {
  const now = Date.now();
  let key: string;
  try {
    key = await clientKey();
  } catch {
    return true; // fail soft
  }

  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_PER_WINDOW) return false;
  bucket.count += 1;
  return true;
}
