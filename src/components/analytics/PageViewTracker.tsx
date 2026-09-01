import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { trackPageView } from "@/lib/analytics/analytics.functions";

/** Fires one anonymous page-view ping per navigation, after hydration. */
export function PageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (pathname.startsWith("/el/analitika") || pathname.startsWith("/en/analytics")) return;

    const lang = pathname.startsWith("/en") ? "en" : pathname.startsWith("/el") ? "el" : null;
    void trackPageView({
      data: { path: pathname, lang, referrer: document.referrer || undefined },
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
