import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell, Field } from "@/components/site/AuthShell";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/integrations/supabase/client";
import { dict } from "@/lib/astro/i18n";
import { btnPrimary, field, fieldError } from "@/lib/ui";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Επαναφορά κωδικού — Zodiac Zone" },
      { name: "description", content: "Ζήτησε σύνδεσμο επαναφοράς κωδικού για τον λογαριασμό σου στο Zodiac Zone." },
      { property: "og:title", content: "Επαναφορά κωδικού — Zodiac Zone" },
      { property: "og:description", content: "Στείλε email και όρισε νέο κωδικό." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [lang] = useLang();
  const t = dict(lang).auth;

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!email.trim()) return setError(t.errors.emailRequired);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t.errors.emailInvalid);
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setBusy(false);
    if (err) {
      setFormError(err.message || t.errors.generic);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title={t.resetSentTitle} subtitle={t.resetSentBody}>
        <Link to="/auth/login" className={btnPrimary}>
          {t.backToLogin}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.forgotTitle} subtitle={t.forgotSubtitle}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field label={t.email} error={error ?? undefined}>
          <input
            className={error ? fieldError : field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? t.working : t.sendResetLink}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:underline">
          {t.backToLogin}
        </Link>
      </p>
    </AuthShell>
  );
}
