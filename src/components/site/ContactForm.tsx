import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { dict } from "@/lib/astro/i18n";
import type { Lang } from "@/lib/astro/types";
import { btnPrimary, field, fieldError } from "@/lib/ui";
import {
  EMAIL_RE,
  NAME_RE,
  TEXT_RE,
  sanitizeEmail,
  sanitizeName,
  sanitizeText,
} from "@/lib/site/contact-schema";
import { sendContactMessage } from "@/lib/site/contact.functions";
import { getCaptchaChallenge } from "@/lib/site/captcha.functions";

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "captcha", string>>;

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function ContactForm({ lang }: { lang: Lang }) {
  const t = dict(lang).site.contactForm;
  const send = useServerFn(sendContactMessage);
  const newChallenge = useServerFn(getCaptchaChallenge);

  const [captcha, setCaptcha] = useState<{ token: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const loadCaptcha = useCallback(async () => {
    setCaptcha(null);
    setCaptchaAnswer("");
    try {
      const c = await newChallenge({ data: { lang } });
      setCaptcha(c);
    } catch {
      setCaptcha(null);
    }
  }, [newChallenge, lang]);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "limited">("idle");

  const set = (key: keyof typeof values, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  function validate(): Errors {
    const next: Errors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const subject = values.subject.trim();
    const message = values.message.trim();

    if (name.length < 2 || name.length > 80 || !NAME_RE.test(name)) next.name = t.errors.name;
    if (!EMAIL_RE.test(email) || email.length > 160) next.email = t.errors.email;
    if (subject && (subject.length > 120 || !TEXT_RE.test(subject))) next.subject = t.errors.subject;
    if (!captcha || !/^\d{1,3}$/.test(captchaAnswer.trim())) next.captcha = t.errors.captcha;
    if (message.length < 10 || message.length > 2000 || !TEXT_RE.test(message))
      next.message = t.errors.message;
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error(lang === "el" ? "Έλεγξε τα πεδία της φόρμας" : "Please check the form fields");
      return;
    }

    setStatus("sending");
    try {
      await send({
        data: {
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          lang,
          captchaToken: captcha!.token,
          captchaAnswer: captchaAnswer.trim(),
          website: honeypot,
        },
      });
      setStatus("sent");
      setValues({ name: "", email: "", subject: "", message: "" });
      toast.success(t.success);
      void loadCaptcha();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const limited = /rate_limited|429|too many/i.test(msg);
      setStatus(limited ? "limited" : "error");
      if (!limited) setErrors((prev) => ({ ...prev, captcha: t.errors.captcha }));
      toast.error(limited ? t.rateLimited : t.error);
      void loadCaptcha();
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
      <div>
        <label htmlFor="cf-name" className="font-body text-sm text-foreground">
          {t.name}
        </label>
        <input
          id="cf-name"
          value={values.name}
          onChange={(e) => set("name", sanitizeName(e.target.value).slice(0, 80))}
          className={`mt-1 ${errors.name ? fieldError : field}`}
          autoComplete="name"
          required
        />
        {errors.name ? (
          <p className="mt-1 font-body text-xs text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="cf-email" className="font-body text-sm text-foreground">
          {t.email}
        </label>
        <input
          id="cf-email"
          type="email"
          value={values.email}
          onChange={(e) => set("email", sanitizeEmail(e.target.value).slice(0, 160))}
          className={`mt-1 ${errors.email ? fieldError : field}`}
          autoComplete="email"
          required
        />
        {errors.email ? (
          <p className="mt-1 font-body text-xs text-destructive">{errors.email}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="cf-subject" className="font-body text-sm text-foreground">
          {t.subject}
        </label>
        <input
          id="cf-subject"
          value={values.subject}
          onChange={(e) => set("subject", sanitizeText(e.target.value).slice(0, 120))}
          className={`mt-1 ${errors.subject ? fieldError : field}`}
        />
        {errors.subject ? (
          <p className="mt-1 font-body text-xs text-destructive">{errors.subject}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="cf-message" className="font-body text-sm text-foreground">
          {t.message}
        </label>
        <textarea
          id="cf-message"
          rows={6}
          value={values.message}
          onChange={(e) => set("message", sanitizeText(e.target.value).slice(0, 2000))}
          className={`mt-1 resize-y ${errors.message ? fieldError : field}`}
          required
        />
        <p className="mt-1 font-body text-xs text-muted-foreground">{t.allowed}</p>
        {errors.message ? (
          <p className="mt-1 font-body text-xs text-destructive">{errors.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="cf-captcha" className="font-body text-sm text-foreground">
          {t.captcha}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-body text-sm text-foreground">
            {captcha ? captcha.question : t.captchaLoading}
          </span>
          <input
            id="cf-captcha"
            inputMode="numeric"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className={`w-24 ${errors.captcha ? fieldError : field}`}
            autoComplete="off"
            required
          />
          <button
            type="button"
            onClick={() => void loadCaptcha()}
            className="font-body text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t.captchaRefresh}
          </button>
        </div>
        <p className="mt-1 font-body text-xs text-muted-foreground">{t.captchaHint}</p>
        {errors.captcha ? (
          <p className="mt-1 font-body text-xs text-destructive">{errors.captcha}</p>
        ) : null}
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending" || status === "limited"}
        className={`${btnPrimary} inline-flex items-center justify-center gap-2`}
      >
        {status === "sending" ? (
          <>
            <Spinner className="h-4 w-4" />
            {t.sending}
          </>
        ) : (
          t.submit
        )}
      </button>

      {status === "sent" ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-lg leading-none">
              ✓
            </span>
            <span className="font-body">{t.success}</span>
          </div>
        </div>
      ) : null}
      {status === "limited" ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-lg leading-none">
              ⏳
            </span>
            <span className="font-body">{t.rateLimited}</span>
          </div>
        </div>
      ) : null}
      {status === "error" ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-lg leading-none">
              ✕
            </span>
            <span className="font-body">{t.error}</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
