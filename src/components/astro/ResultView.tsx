import { dict, ordinalHouse, tAspect, tPlanet, tSign } from "@/lib/astro/i18n";
import type { AtomAspect, AtomPlacement, Lang, Synthesis, TopicExpansion } from "@/lib/astro/types";

/* ── Helpers ──────────────────────────────────────────────────────────── */

/** Μικρός τίτλος + κείμενο. Χρησιμοποιείται στις καρτέλες Θέσεις και Όψεις. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs uppercase tracking-[0.2em] text-primary">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/90" style={{ maxWidth: "65ch" }}>
        {children}
      </div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k, i) => (
        <span
          key={`${k}-${i}`}
          className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
        >
          {k}
        </span>
      ))}
    </div>
  );
}

/** Τίτλος ενότητας στην κύρια ανάλυση. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-display text-primary" style={{ fontSize: "1.25rem", letterSpacing: "0.01em" }}>
      {children}
    </h4>
  );
}

/** Σώμα κειμένου με περιορισμένο πλάτος ανάγνωσης. */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-foreground/90" style={{ fontSize: "0.95rem", lineHeight: 1.75, maxWidth: "65ch" }}>
      {children}
    </div>
  );
}

/** Διακοσμητικός διαχωριστής που σβήνει στις άκρες. */
function Ornament() {
  return (
    <div
      aria-hidden="true"
      className="my-8 h-px w-full"
      style={{
        background: "linear-gradient(to right, transparent, var(--color-border), transparent)",
      }}
    />
  );
}

/** Αριθμημένος τομέας ζωής, σε πλήρες πλάτος. */
function NumberedArea({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex gap-5">
      <span
        aria-hidden="true"
        className="font-display shrink-0 text-primary/40"
        style={{ fontSize: "1.75rem", lineHeight: 1.2 }}
      >
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 space-y-2">
        <SectionLabel>{title}</SectionLabel>
        <Prose>{children}</Prose>
      </div>
    </section>
  );
}

/** Λίστα με κουκκίδα. Χρυσή για τα δυνατά, μοβ για τις εντάσεις. */
function MarkedList({ items, tone }: { items: string[]; tone: "up" | "down" }) {
  return (
    <ul className="space-y-3">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-foreground/90" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
          <span
            aria-hidden="true"
            className="mt-[0.5em] shrink-0"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: tone === "up" ? "var(--color-primary)" : "var(--color-accent)",
              opacity: tone === "up" ? 1 : 0.75,
            }}
          />
          <span className="min-w-0">{text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── ResultView ───────────────────────────────────────────────────────── */

export function ResultView({ kind, data, lang }: { kind: string; data: unknown; lang: Lang }) {
  if (!data) return null;
  const t = dict(lang);

  /* Θέση πλανήτη — εργαλείο παραγωγής atoms */
  if (kind === "placement") {
    const list = (Array.isArray(data) ? data : [data]) as AtomPlacement[];
    return (
      <div className="space-y-8">
        {list.map((a, i) => (
          <article key={i} className="space-y-5">
            <h3 className="font-display text-2xl text-foreground">
              {tPlanet(a.planet, lang)}
              {lang === "el" ? " στον " : " in "}
              {tSign(a.sign, lang)} · {ordinalHouse(a.house, lang)}
            </h3>
            {a.core && <Block title={t.core}>{a.core}</Block>}
            {a.arena && <Block title={t.arena}>{a.arena}</Block>}
            {a.growth && <Block title={t.growth}>{a.growth}</Block>}
            {a.keywords?.length > 0 && (
              <Block title={t.keywords}>
                <Chips items={a.keywords} />
              </Block>
            )}
          </article>
        ))}
      </div>
    );
  }

  /* Όψη — εργαλείο παραγωγής atoms */
  if (kind === "aspect") {
    const a = data as AtomAspect;
    return (
      <article className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl text-foreground">
            {tPlanet(a.planet_a, lang)} {tAspect(a.aspect, lang)} {tPlanet(a.planet_b, lang)}
          </h3>
          {a.intensity && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {t.intensity[a.intensity] ?? a.intensity}
            </span>
          )}
        </div>
        {a.dynamic && <Block title={t.dynamic}>{a.dynamic}</Block>}
        {a.shows_up && <Block title={t.showsUp}>{a.shows_up}</Block>}
        {a.work && <Block title={t.work}>{a.work}</Block>}
      </article>
    );
  }

  /* Η κύρια ανάλυση του χάρτη */
  if (kind === "synthesis") {
    const s = data as Synthesis;
    const hasLists = s.strengths?.length > 0 || s.tensions?.length > 0;

    return (
      <article>
        {/* 1 — Η υπογραφή */}
        {s.signature && (
          <header className="space-y-4">
            <p className="text-xs uppercase text-muted-foreground" style={{ letterSpacing: "0.3em" }}>
              {t.signatureTitle}
            </p>
            <p
              className="font-display text-foreground"
              style={{
                fontSize: "clamp(1.35rem, 2.6vw, 1.75rem)",
                lineHeight: 1.5,
                maxWidth: "58ch",
              }}
            >
              {s.signature}
            </p>
          </header>
        )}

        {s.signature && hasLists && <Ornament />}

        {/* 2 — Δυνατά σημεία και εντάσεις */}
        {hasLists && (
          <div className="grid gap-10 sm:grid-cols-2">
            {s.strengths?.length > 0 && (
              <div className="space-y-4">
                <SectionLabel>{t.strengths}</SectionLabel>
                <MarkedList items={s.strengths} tone="up" />
              </div>
            )}
            {s.tensions?.length > 0 && (
              <div className="space-y-4">
                <SectionLabel>{t.tensions}</SectionLabel>
                <MarkedList items={s.tensions} tone="down" />
              </div>
            )}
          </div>
        )}

        {s.life_areas && <Ornament />}

        {/* 3 — Τομείς ζωής */}
        {s.life_areas && (
          <div className="space-y-9">
            <NumberedArea index={1} title={t.relationships}>
              {s.life_areas.relationships}
            </NumberedArea>
            <NumberedArea index={2} title={t.workArea}>
              {s.life_areas.work}
            </NumberedArea>
            <NumberedArea index={3} title={t.innerLife}>
              {s.life_areas.inner_life}
            </NumberedArea>
          </div>
        )}

        {/* 4 — Το κλείσιμο */}
        {s.one_thing && (
          <div
            className="mt-12 rounded-2xl p-6 sm:p-8"
            style={{
              border: "1px solid color-mix(in oklch, var(--color-primary) 40%, transparent)",
              background: "color-mix(in oklch, var(--color-primary) 7%, transparent)",
            }}
          >
            <p className="mb-3 text-xs uppercase text-primary" style={{ letterSpacing: "0.25em" }}>
              {t.oneThing}
            </p>
            <p
              className="font-display text-foreground"
              style={{ fontSize: "1.15rem", lineHeight: 1.6, maxWidth: "60ch" }}
            >
              {s.one_thing}
            </p>
          </div>
        )}
      </article>
    );
  }

  /* Θέμα εμβάθυνσης */
  const topic = data as TopicExpansion;
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase text-muted-foreground" style={{ letterSpacing: "0.3em" }}>
          {t.tabs.topic.label}
        </p>
        <h3 className="font-display text-3xl text-primary">
          {t.topics[topic.topic as keyof typeof t.topics] ?? topic.topic}
        </h3>
      </header>

      {topic.body && (
        <Prose>
          <div className="space-y-4">
            {topic.body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </Prose>
      )}

      {topic.placements_used?.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs uppercase text-muted-foreground" style={{ letterSpacing: "0.2em" }}>
            {t.placementsUsed}
          </p>
          <Chips items={topic.placements_used} />
        </div>
      )}
    </article>
  );
}
