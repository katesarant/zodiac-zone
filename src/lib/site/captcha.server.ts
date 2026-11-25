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
  if (!secret) throw new Error("captcha_unavailable");
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
  const random = crypto.getRandomValues(new Uint8Array(3));
  const a = 1 + (random[0] ?? 0) % 9;
  const b = 1 + (random[1] ?? 0) % 9;
  const plus = (random[2] ?? 0) % 2 === 0;
  const answer = plus ? a + b : Math.max(a, b) - Math.min(a, b);
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(24)));
  const payload = `v2.${nonce}.${Date.now()}`;
  // Only a keyed proof is exposed, never the answer or an unkeyed answer hash.
  const token = `${payload}.${await sign(`${payload}.${answer}`)}`;

  const op = plus ? "+" : "−";
  const [x, y] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)];
  const question =
    lang === "el" ? `Πόσο κάνει ${x} ${op} ${y};` : `What is ${x} ${op} ${y}?`;

  return { token, question };
}

export async function verifyChallenge(token: string, answer: string): Promise<boolean> {
  const parts = String(token).split(".");
  const [version, nonce, issuedAt, sig] = parts;
  const submitted = String(answer).trim();
  if (parts.length !== 4 || version !== "v2" || !nonce || !issuedAt || !sig) return false;
  if (!/^[A-Za-z0-9_-]{32}$/.test(nonce) || !/^\d{13}$/.test(issuedAt)
      || !/^[A-Za-z0-9_-]{43}$/.test(sig) || !/^\d{1,3}$/.test(submitted)) return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;

  const age = Date.now() - issued;
  if (age > TTL_MS || age < MIN_MS) return false;

  try {
    return (await sign(`v2.${nonce}.${issuedAt}.${submitted}`)) === sig;
  } catch {
    return false;
  }
}
