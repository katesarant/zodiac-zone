import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  locale: z.enum(["el", "en"]),
});

/** Read the signed-in user's profile row (creates a default one if missing). */
export const getProfileFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, locale, charts_quota")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      displayName: data?.display_name ?? "",
      locale: (data?.locale === "en" ? "en" : "el") as "el" | "en",
      chartsQuota: data?.charts_quota ?? 3,
    };
  });

/** Save display name + preferred language. RLS scopes the write to the caller. */
export const updateProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, display_name: data.displayName, locale: data.locale }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * GDPR erasure: removes every row belonging to the caller and then the auth
 * user itself. Service role is loaded inside the handler, after the caller has
 * been authenticated, so it never reaches the client bundle.
 */
export const deleteAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ confirm: z.literal("DELETE") }).parse(input))
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const charts = await supabaseAdmin.from("charts").delete().eq("user_id", userId);
    if (charts.error) throw new Error(charts.error.message);

    const profile = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profile.error) throw new Error(profile.error.message);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
