import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

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

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm({ lang }: { lang: Lang }) {
  const t = dict(lang).site.contactForm;
  const send = useServerFn(sendContactMessage);

  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    if (message.length < 10 || message.length > 2000 || !TEXT_RE.test(message))
      next.message = t.errors.message;
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    try {
      await send({
        data: {
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          lang,
        },
      });
      setStatus("sent");
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
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

      <button type="submit" disabled={status === "sending"} className={btnPrimary}>
        {status === "sending" ? t.sending : t.submit}
      </button>

      {status === "sent" ? (
        <p role="status" className="font-body text-sm text-primary">
          {t.success}
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="font-body text-sm text-destructive">
          {t.error}
        </p>
      ) : null}
    </form>
  );
}
