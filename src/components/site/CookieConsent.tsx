import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { dict } from "@/lib/astro/i18n";
import type { Lang } from "@/lib/astro/types";
import { PathLink } from "@/components/horoscope/PathLink";
import { sitePagePath } from "@/lib/site/pages";

const KEY = "zz-consent:v1";

export type ConsentValue = "accepted" | "rejected";

/** Reads the stored advertising/analytics consent. Browser only. */
export function readConsent(): ConsentValue | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lang: Lang = pathname.startsWith("/en") ? "en" : "el";
  const c = dict(lang).site.cookie;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
  }, []);

  const choose = (value: ConsentValue) => {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent<ConsentValue>("zz-consent-change", { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 print:hidden"
    >
      <div className="panel mx-auto flex w-full max-w-3xl flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <p className="flex-1 font-body text-xs leading-relaxed text-foreground/90">
          {c.text}{" "}
          <PathLink href={sitePagePath("privacy", lang)} className="text-primary underline">
            {c.more}
          </PathLink>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-lg border border-border px-3 py-1.5 font-body text-xs text-foreground transition-colors hover:bg-secondary"
          >
            {c.reject}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-lg bg-primary px-3 py-1.5 font-body text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {c.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
