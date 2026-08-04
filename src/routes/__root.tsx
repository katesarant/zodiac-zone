import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ζωδιακός τροχός — διακοσμητικός, αργή περιστροφή */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute h-[min(90vw,620px)] w-[min(90vw,620px)] animate-[spin_120s_linear_infinite] text-primary opacity-[0.13]"
      >
        <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="200" cy="200" r="168" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="118" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1={200 + 118 * Math.cos(a)}
              y1={200 + 118 * Math.sin(a)}
              x2={200 + 196 * Math.cos(a)}
              y2={200 + 196 * Math.sin(a)}
              stroke="currentColor"
              strokeWidth="0.75"
            />
          );
        })}
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * (Math.PI / 180);
          return (
            <line
              key={`t${i}`}
              x1={200 + 168 * Math.cos(a)}
              y1={200 + 168 * Math.sin(a)}
              x2={200 + 176 * Math.cos(a)}
              y2={200 + 176 * Math.sin(a)}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      {/* Αστέρια */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute h-[min(96vw,680px)] w-[min(96vw,680px)] text-primary opacity-40"
      >
        {[
          [58, 92, 1.4],
          [126, 44, 0.9],
          [312, 78, 1.2],
          [354, 168, 0.8],
          [40, 262, 1.1],
          [96, 336, 0.9],
          [286, 322, 1.3],
          [348, 286, 0.8],
          [178, 26, 0.7],
          [222, 372, 1],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />
        ))}
      </svg>

      <div className="panel relative z-10 max-w-md px-8 py-12 text-center sm:px-12">
        <p className="font-body text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground">Zodiac Zone</p>

        <h1 className="mt-6 font-display text-8xl font-semibold leading-none text-primary">404</h1>

        <div
          aria-hidden="true"
          className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent"
        />

        <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">
          Αυτή η σελίδα δεν βρέθηκε στον χάρτη
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ο σύνδεσμος μπορεί να άλλαξε ή να μην υπήρξε ποτέ.
        </p>

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground/70">
          This page isn&apos;t on the chart — the link may have moved or never existed.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Αρχική σελίδα
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Φτιάξε τον χάρτη σου
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zodiac Zone — Γενέθλιος αστρολογικός χάρτης στα ελληνικά & αγγλικά" },
      {
        name: "description",
        content:
          "Υπολόγισε δωρεάν τον γενέθλιο χάρτη σου και διάβασε αναλυτική ερμηνεία για Ήλιο, Σελήνη, Ωροσκόπο, οίκους και όψεις — στα ελληνικά και στα αγγλικά.",
      },
      { name: "theme-color", content: "#1c1733" },

      { property: "og:site_name", content: "Zodiac Zone" },
      { property: "og:title", content: "Zodiac Zone — Ο γενέθλιος χάρτης σου" },
      {
        property: "og:description",
        content: "Δωρεάν υπολογισμός και ανάλυση γενέθλιου χάρτη, στα ελληνικά και στα αγγλικά.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "el_GR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:url", content: "https://zodiaczone.gr/" },
      { property: "og:image", content: "https://zodiaczone.gr/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Zodiac Zone" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Zodiac Zone — Ο γενέθλιος χάρτης σου" },
      { name: "twitter:image", content: "https://zodiaczone.gr/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Karla:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "canonical", href: "https://zodiaczone.gr/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
