import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthShell, Field } from "@/components/site/AuthShell";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/integrations/supabase/client";
import { dict } from "@/lib/astro/i18n";
import { btnPrimary, field, fieldError } from "@/lib/ui";

export const Route = createFileRoute("/auth/reset")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Νέος κωδικός — Zodiac Zone" },
      { name: "description", content: "Όρισε νέο κωδικό για τον λογαριασμό σου στο Zodiac Zone." },
      { property: "og:title", content: "Νέος κωδικός — Zodiac Zone" },
      { property: "og:description", content: "Ολοκλήρωσε την επαναφορά του κωδικού σου." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [lang] = useLang();
  const t = dict(lang).auth;
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setHasSession(Boolean(session));
      setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function validate() {
    const next: Record<string, string> = {};
    if (!password) next["password"] = t.errors.passwordRequired;
    else if (password.length < 8) next["password"] = t.errors.passwordShort;
    if (confirm !== password) next["confirm"] = t.errors.passwordMismatch;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setFormError(error.message || t.errors.generic);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title={t.passwordChanged} subtitle={t.loginSubtitle}>
        <button type="button" className={btnPrimary} onClick={() => navigate({ to: "/account" })}>
          {t.account}
        </button>
      </AuthShell>
    );
  }

  if (ready && !hasSession) {
    return (
      <AuthShell title={t.resetTitle} subtitle={t.errors.noResetSession}>
        <Link to="/auth/forgot" className={btnPrimary}>
          {t.sendResetLink}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.resetTitle} subtitle={t.resetSubtitle}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field label={t.newPassword} error={errors["password"]}>
          <input
            className={errors["password"] ? fieldError : field}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label={t.confirmPassword} error={errors["confirm"]}>
          <input
            className={errors["confirm"] ? fieldError : field}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <button type="submit" className={btnPrimary} disabled={busy || !ready}>
          {busy ? t.working : t.changePassword}
        </button>
      </form>
    </AuthShell>
  );
}
