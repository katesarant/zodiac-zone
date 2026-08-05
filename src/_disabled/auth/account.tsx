import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Field } from "@/components/site/AuthShell";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccountFn, getProfileFn, updateProfileFn } from "@/lib/account.functions";
import { dict } from "@/lib/astro/i18n";
import type { Lang } from "@/lib/astro/types";
import { btnDestructive, btnPrimary, field, fieldError } from "@/lib/ui";

export const Route = createFileRoute("/account")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth/login", search: { redirect: location.pathname } });
    }
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Ο λογαριασμός μου — Zodiac Zone" },
      { name: "description", content: "Διαχειρίσου το όνομα εμφάνισης, τη γλώσσα και τον κωδικό σου στο Zodiac Zone." },
      { property: "og:title", content: "Ο λογαριασμός μου — Zodiac Zone" },
      { property: "og:description", content: "Ρυθμίσεις προφίλ και ασφάλειας." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [lang, setLang] = useLang();
  const t = dict(lang).auth;
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadProfile = useServerFn(getProfileFn);
  const saveProfile = useServerFn(updateProfileFn);
  const deleteAccount = useServerFn(deleteAccountFn);

  const [displayName, setDisplayName] = useState("");
  const [locale, setLocale] = useState<Lang>(lang);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  const [confirmWord, setConfirmWord] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    void loadProfile()
      .then((p) => {
        if (!active) return;
        setDisplayName(p.displayName);
        setLocale(p.locale);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [loadProfile]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    if (!displayName.trim()) {
      setProfileError(t.errors.displayNameRequired);
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfile({ data: { displayName: displayName.trim(), locale } });
      setLang(locale);
      setProfileSaved(true);
    } catch {
      setProfileError(t.errors.generic);
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwMessage(null);
    const next: Record<string, string> = {};
    if (!currentPassword) next["current"] = t.errors.passwordRequired;
    if (!newPassword) next["new"] = t.errors.passwordRequired;
    else if (newPassword.length < 8) next["new"] = t.errors.passwordShort;
    if (confirmPassword !== newPassword) next["confirm"] = t.errors.passwordMismatch;
    setPwErrors(next);
    if (Object.keys(next).length > 0) return;

    setChangingPw(true);
    // Re-authenticate with the current password before allowing the change.
    const check = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: currentPassword,
    });
    if (check.error) {
      setChangingPw(false);
      setPwError(t.errors.wrongCurrentPassword);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) {
      setPwError(error.message || t.errors.generic);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwMessage(t.passwordChanged);
  }

  async function onDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError(null);
    if (confirmWord.trim() !== "DELETE") {
      setDeleteError(t.errors.typeDelete);
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount({ data: { confirm: "DELETE" as const } });
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      navigate({ to: "/", replace: true });
    } catch {
      setDeleteError(t.errors.generic);
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">{t.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.accountSubtitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
      </header>

      <section className="panel p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">{t.profileSection}</h2>
        <form className="mt-4 space-y-4" onSubmit={onSaveProfile} noValidate>
          <Field label={t.displayName} error={profileError ?? undefined}>
            <input
              className={profileError ? fieldError : field}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label={t.language}>
            <select className={field} value={locale} onChange={(e) => setLocale(e.target.value as Lang)}>
              <option value="el">{t.greek}</option>
              <option value="en">{t.english}</option>
            </select>
          </Field>
          {profileSaved ? <p className="text-sm text-primary">{t.saved}</p> : null}
          <button type="submit" className={btnPrimary} disabled={savingProfile}>
            {savingProfile ? t.saving : t.saveChanges}
          </button>
        </form>
      </section>

      <section className="panel p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">{t.passwordSection}</h2>
        <form className="mt-4 space-y-4" onSubmit={onChangePassword} noValidate>
          <Field label={t.currentPassword} error={pwErrors["current"]}>
            <input
              className={pwErrors["current"] ? fieldError : field}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field label={t.newPassword} error={pwErrors["new"]}>
            <input
              className={pwErrors["new"] ? fieldError : field}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field label={t.confirmPassword} error={pwErrors["confirm"]}>
            <input
              className={pwErrors["confirm"] ? fieldError : field}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          {pwError ? <p className="text-sm text-destructive">{pwError}</p> : null}
          {pwMessage ? <p className="text-sm text-primary">{pwMessage}</p> : null}
          <button type="submit" className={btnPrimary} disabled={changingPw}>
            {changingPw ? t.working : t.changePassword}
          </button>
        </form>
      </section>

      <section className="panel border-destructive/60 p-6">
        <h2 className="font-display text-xl font-semibold text-destructive">{t.dangerSection}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.deleteBody}</p>
        <form className="mt-4 space-y-4" onSubmit={onDelete} noValidate>
          <Field label={t.deleteConfirmLabel} error={deleteError ?? undefined}>
            <input
              className={deleteError ? fieldError : field}
              value={confirmWord}
              onChange={(e) => setConfirmWord(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </Field>
          <button type="submit" className={btnDestructive} disabled={deleting}>
            {deleting ? t.deleting : t.deleteAccount}
          </button>
        </form>
      </section>
    </main>
  );
}
