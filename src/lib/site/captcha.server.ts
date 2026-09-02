/** Ενσωματωμένο CAPTCHA: υπογεγραμμένη μαθηματική ερώτηση, χωρίς τρίτους παρόχους. */

const TTL_MS = 10 * 60 * 1000;
const MIN_MS = 2500;

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string) {
  const secret = process.env["CONTACT_CAPTCHA_SECRET"] ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

export type Challenge = { token: string; question: string };

export async function createChallenge(lang: "el" | "en"): Promise<Challenge> {
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const plus = Math.random() < 0.5;
  const answer = plus ? a + b : Math.max(a, b) - Math.min(a, b);
  const payload = `${answer}.${Date.now()}`;
  const token = `${b64url(new TextEncoder().encode(payload))}.${await sign(payload)}`;

  const op = plus ? "+" : "−";
  const [x, y] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)];
  const question =
    lang === "el" ? `Πόσο κάνει ${x} ${op} ${y};` : `What is ${x} ${op} ${y}?`;

  return { token, question };
}

export async function verifyChallenge(token: string, answer: string): Promise<boolean> {
  const [encoded, sig] = String(token).split(".");
  if (!encoded || !sig) return false;

  let payload: string;
  try {
    const bin = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    payload = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return false;
  }

  if ((await sign(payload)) !== sig) return false;

  const [expected, issuedAt] = payload.split(".");
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;

  const age = Date.now() - issued;
  if (age > TTL_MS || age < MIN_MS) return false;

  return String(answer).trim() === expected;
}
