import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { AuthShell, Field } from "@/components/site/AuthShell";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/integrations/supabase/client";
import { dict } from "@/lib/astro/i18n";
import { btnPrimary, field, fieldError } from "@/lib/ui";

const searchSchema = z.object({
  redirect: z.string().startsWith("/").optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Σύνδεση — Zodiac Zone" },
      { name: "description", content: "Συνδέσου στο Zodiac Zone για να δεις τους αποθηκευμένους γενέθλιους χάρτες σου." },
      { property: "og:title", content: "Σύνδεση — Zodiac Zone" },
      { property: "og:description", content: "Μπες στον λογαριασμό σου και δες τους χάρτες σου." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [lang] = useLang();
  const t = dict(lang).auth;
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!email.trim()) next["email"] = t.errors.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next["email"] = t.errors.emailInvalid;
    if (!password) next["password"] = t.errors.passwordRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      setFormError(
        msg.includes("confirm")
          ? t.errors.emailNotConfirmed
          : msg.includes("invalid")
            ? t.errors.invalidCredentials
            : error.message || t.errors.generic,
      );
      return;
    }
    navigate({ to: search.redirect ?? "/my-charts", replace: true });
  }

  return (
    <AuthShell title={t.loginTitle} subtitle={t.loginSubtitle}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
            autoComplete="current-password"
          />
        </Field>

        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

        <button type="submit" className={btnPrimary} disabled={busy}>
          {busy ? t.working : t.signIn}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          <Link to="/auth/forgot" className="text-primary hover:underline">
            {t.forgotLink}
          </Link>
        </p>
        <p>
          {t.noAccount}{" "}
          <Link to="/auth/signup" className="text-primary hover:underline">
            {t.signUp}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
