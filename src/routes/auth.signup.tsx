import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell, Field } from "@/components/site/AuthShell";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/integrations/supabase/client";
import { dict } from "@/lib/astro/i18n";
import { btnPrimary, field, fieldError } from "@/lib/ui";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Εγγραφή — Zodiac Zone" },
      { name: "description", content: "Δημιούργησε λογαριασμό Zodiac Zone για να αποθηκεύεις τους γενέθλιους χάρτες σου." },
      { property: "og:title", content: "Εγγραφή — Zodiac Zone" },
      { property: "og:description", content: "Φτιάξε λογαριασμό και κράτα τους χάρτες σου σε ένα μέρος." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [lang] = useLang();
  const t = dict(lang).auth;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!displayName.trim()) next["displayName"] = t.errors.displayNameRequired;
    if (!email.trim()) next["email"] = t.errors.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next["email"] = t.errors.emailInvalid;
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
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
        data: { display_name: displayName.trim() },
      },
    });
    setBusy(false);
    if (error) {
      setFormError(error.message || t.errors.generic);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title={t.checkEmailTitle} subtitle={t.checkEmailBody}>
        <button type="button" className={btnPrimary} onClick={() => navigate({ to: "/auth/login" })}>
          {t.backToLogin}
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.signupTitle} subtitle={t.signupSubtitle}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field label={t.displayName} error={errors["displayName"]}>
          <input
            className={errors["displayName"] ? fieldError : field}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label={t.email} error={errors["email"]}>
          <input
            className={errors["email"] ? fieldError : field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label={t.password} error={errors["password"]}>
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

        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? t.working : t.signUp}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {t.haveAccount}{" "}
        <Link to="/auth/login" className="text-primary hover:underline">
          {t.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}
