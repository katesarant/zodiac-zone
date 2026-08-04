// Cookie-backed Supabase client for server functions and server routes.
// Reads/writes the auth session from request cookies so the server can
// identify the signed-in user. Uses only the publishable (anon) key —
// never the service role key.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

import type { Database } from "@/integrations/supabase/types";

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    // Opaque sb_ keys are not JWTs; PostgREST rejects them as bearer tokens.
    if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

/** Create a request-scoped Supabase client. Call inside a server handler only. */
export function createSupabaseServerClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const anonKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_ANON_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !anonKey) {
    throw new Error("Missing Supabase URL or publishable key on the server.");
  }

  return createServerClient<Database>(url, anonKey, {
    global: { fetch: supabaseFetch(anonKey) },
    cookies: {
      getAll() {
        const all = getCookies() ?? {};
        return Object.entries(all).map(([name, value]) => ({ name, value: value ?? "" }));
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, { path: "/", sameSite: "lax", httpOnly: true, ...options });
        }
      },
    },
  });
}

/** Returns the signed-in user for the current request, or null. */
export async function getServerUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
