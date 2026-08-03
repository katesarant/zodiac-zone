import { dict, ordinalHouse, tAspect, tPlanet, tSign } from "@/lib/astro/i18n";
import type {
  AtomAspect,
  AtomPlacement,
  Lang,
  Synthesis,
  TopicExpansion,
} from "@/lib/astro/types";

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

export function ResultView({
  kind,
  data,
  lang,
}: {
  kind: string;
  data: unknown;
  lang: Lang;
}) {
  if (!data) return null;
  const t = dict(lang);

  if (kind === "placement") {
    const list = (Array.isArray(data) ? data : [data]) as AtomPlacement[];
    return (
      <div className="space-y-8">
        {list.map((a, i) => (
          <article key={i} className="space-y-5">
            <h3 className="text-2xl">
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

  if (kind === "aspect") {
    const a = data as AtomAspect;
    return (
      <article className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-2xl">
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

  if (kind === "synthesis") {
    const s = data as Synthesis;
    return (
      <article className="space-y-6">
        {s.signature && (
          <p className="text-lg leading-relaxed italic text-foreground">{s.signature}</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {s.strengths?.length > 0 && (
            <Block title={t.strengths}>
              <Bullets items={s.strengths} />
            </Block>
          )}
          {s.tensions?.length > 0 && (
            <Block title={t.tensions}>
              <Bullets items={s.tensions} />
            </Block>
          )}
        </div>
        {s.life_areas && (
          <div className="grid gap-5 sm:grid-cols-3">
            <Block title={t.relationships}>{s.life_areas.relationships}</Block>
            <Block title={t.workArea}>{s.life_areas.work}</Block>
            <Block title={t.innerLife}>{s.life_areas.inner_life}</Block>
          </div>
        )}
        {s.one_thing && (
          <div className="rounded-xl border border-primary/40 bg-secondary/50 p-4">
            <Block title={t.oneThing}>{s.one_thing}</Block>
          </div>
        )}
      </article>
    );
  }

  const topic = data as TopicExpansion;
  return (
    <article className="space-y-5">
      <h3 className="text-2xl">
        {t.topics[topic.topic as keyof typeof t.topics] ?? topic.topic}
      </h3>
      {topic.body && (
        <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
          {topic.body
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      )}
      {topic.placements_used?.length > 0 && (
        <Block title={t.placementsUsed}>
          <Chips items={topic.placements_used} />
        </Block>
      )}
    </article>
  );
}
