import type {
  AtomAspect,
  AtomPlacement,
  Synthesis,
  TopicExpansion,
} from "@/lib/astro/types";

const TOPIC_LABELS: Record<string, string> = {
  relationships: "Σχέσεις",
  career: "Καριέρα",
  communication: "Επικοινωνία",
  emotional_needs: "Συναισθηματικές ανάγκες",
  strengths: "Δυνατά σημεία",
  blind_spots: "Τυφλά σημεία",
};

const INTENSITY_LABELS: Record<string, string> = {
  low: "χαμηλή ένταση",
  medium: "μέτρια ένταση",
  high: "υψηλή ένταση",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs uppercase tracking-[0.2em] text-primary">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k) => (
        <span
          key={k}
          className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResultView({ kind, data }: { kind: string; data: unknown }) {
  if (!data) return null;

  if (kind === "placement") {
    const list = (Array.isArray(data) ? data : [data]) as AtomPlacement[];
    return (
      <div className="space-y-8">
        {list.map((a, i) => (
          <article key={i} className="space-y-5">
            <h3 className="text-2xl">
              {a.planet} στον {a.sign} · {a.house}ος οίκος
            </h3>
            {a.core && <Block title="Πυρήνας">{a.core}</Block>}
            {a.arena && <Block title="Πεδίο">{a.arena}</Block>}
            {a.growth && <Block title="Εξέλιξη">{a.growth}</Block>}
            {a.keywords?.length > 0 && (
              <Block title="Λέξεις-κλειδιά">
                <Chips items={a.keywords} />
              </Block>
            )}
          </article>
        ))}
      </div>
    );
  }

  if (kind === "aspect") {
    const a = data as AtomAspect;
    return (
      <article className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl">
            {a.planet_a} {a.aspect} {a.planet_b}
          </h3>
          {a.intensity && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {INTENSITY_LABELS[a.intensity] ?? a.intensity}
            </span>
          )}
        </div>
        {a.dynamic && <Block title="Δυναμική">{a.dynamic}</Block>}
        {a.shows_up && <Block title="Πώς εκδηλώνεται">{a.shows_up}</Block>}
        {a.work && <Block title="Δουλειά">{a.work}</Block>}
      </article>
    );
  }

  if (kind === "synthesis") {
    const s = data as Synthesis;
    return (
      <article className="space-y-6">
        {s.signature && (
          <p className="text-lg leading-relaxed italic text-foreground">{s.signature}</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {s.strengths?.length > 0 && (
            <Block title="Δυνάμεις">
              <Bullets items={s.strengths} />
            </Block>
          )}
          {s.tensions?.length > 0 && (
            <Block title="Εντάσεις">
              <Bullets items={s.tensions} />
            </Block>
          )}
        </div>
        {s.life_areas && (
          <div className="grid gap-5 sm:grid-cols-3">
            <Block title="Σχέσεις">{s.life_areas.relationships}</Block>
            <Block title="Εργασία">{s.life_areas.work}</Block>
            <Block title="Εσωτερική ζωή">{s.life_areas.inner_life}</Block>
          </div>
        )}
        {s.one_thing && (
          <div className="rounded-xl border border-primary/40 bg-secondary/50 p-4">
            <Block title="Ένα πράγμα">{s.one_thing}</Block>
          </div>
        )}
      </article>
    );
  }

  const t = data as TopicExpansion;
  return (
    <article className="space-y-5">
      <h3 className="text-2xl">{TOPIC_LABELS[t.topic] ?? t.topic}</h3>
      {t.body && (
        <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
          {t.body
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      )}
      {t.placements_used?.length > 0 && (
        <Block title="Θέσεις που χρησιμοποιήθηκαν">
          <Chips items={t.placements_used} />
        </Block>
      )}
    </article>
  );
}
