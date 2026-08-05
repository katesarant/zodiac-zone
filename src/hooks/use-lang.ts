import { useEffect, useState } from "react";

import type { Lang } from "@/lib/astro/types";

const KEY = "zz-lang";

/** App-wide language, remembered in the browser. SSR-safe: starts at "el". */
export function useLang(initial?: Lang): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(initial ?? "el");

  // Keep state in sync when the route dictates the language (/el vs /en).
  useEffect(() => {
    if (!initial) return;
    setLangState(initial);
    try {
      window.localStorage.setItem(KEY, initial);
    } catch {
      /* ignore */
    }
  }, [initial]);

  useEffect(() => {
    if (initial) {
      // handled above
    } else {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "en" || stored === "el") setLangState(stored);
    }
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Lang>).detail;
      if (next === "en" || next === "el") setLangState(next);
    };
    window.addEventListener("zz-lang-change", onChange);
    return () => window.removeEventListener("zz-lang-change", onChange);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new CustomEvent<Lang>("zz-lang-change", { detail: next }));
  };

  return [lang, setLang];
}
