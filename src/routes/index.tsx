import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SAMPLE_CHART } from "@/lib/astro/chart";
import {
  generateAspectAtomFn,
  generatePlacementAtomFn,
  generateSynthesisFn,
  generateTopicFn,
} from "@/lib/astro/interpretation.functions";
import { TOPICS, type Lang, type Topic } from "@/lib/astro/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Studio — Αστρολογική Ερμηνεία EL/EN" },
      {
        name: "description",
        content:
          "Βιβλιοθήκη prompts για αστρολογική ερμηνεία στα ελληνικά και αγγλικά: atoms πλανητών, όψεις, σύνθεση χάρτη και θέματα εμβάθυνσης.",
      },
      { property: "og:title", content: "Prompt Studio — Αστρολογική Ερμηνεία EL/EN" },
      {
        property: "og:description",
        content:
          "Δομημένα prompts, JSON contract και φίλτρο απαγορευμένων θεμάτων για ερμηνεία γενέθλιου χάρτη.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const SIGNS = [
  "Κριός",
  "Ταύρος",
  "Δίδυμοι",
  "Καρκίνος",
  "Λέων",
  "Παρθένος",
  "Ζυγός",
  "Σκορπιός",
  "Τοξότης",
  "Αιγόκερως",
  "Υδροχόος",
  "Ιχθύες",
];

const PLANETS = [
  "Ήλιος",
  "Σελήνη",
  "Ερμής",
  "Αφροδίτη",
  "Άρης",
  "Δίας",
  "Κρόνος",
  "Ουρανός",
  "Ποσειδώνας",
  "Πλούτωνας",
];

const ASPECTS: Array<{ label: string; angle: number }> = [
  { label: "σύνοδος", angle: 0 },
  { label: "εξάγωνο", angle: 60 },
  { label: "τετράγωνο", angle: 90 },
  { label: "τρίγωνο", angle: 120 },
  { label: "αντίθεση", angle: 180 },
];

type Tab = "placement" | "aspect" | "synthesis" | "topic";

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: "placement", label: "P1 · Θέση", hint: "πλανήτης σε ζώδιο σε οίκο" },
  { id: "aspect", label: "P2 · Όψη", hint: "ζεύγος πλανητών" },
  { id: "synthesis", label: "P3 · Σύνθεση", hint: "ολόκληρος χάρτης" },
  { id: "topic", label: "P4 · Θέμα", hint: "κλειστή λίστα" },
];

const field =
  "w-full rounded-lg border border-input bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

type Result = {
  data: unknown;
  flagged: boolean;
  bannedTerms: string[];
  attempts: number;
};

function Studio() {
  const [lang, setLang] = useState<Lang>("el");
  const [tab, setTab] = useState<Tab>("placement");
  const [planet, setPlanet] = useState(PLANETS[0]!);
  const [sign, setSign] = useState(SIGNS[0]!);
  const [house, setHouse] = useState(1);
  const [planetB, setPlanetB] = useState(PLANETS[6]!);
  const [aspect, setAspect] = useState(ASPECTS[2]!);
  const [topic, setTopic] = useState<Topic>("relationships");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const placementFn = useServerFn(generatePlacementAtomFn);
  const aspectFn = useServerFn(generateAspectAtomFn);
  const synthesisFn = useServerFn(generateSynthesisFn);
  const topicFn = useServerFn(generateTopicFn);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res: Result;
      if (tab === "placement") {
        res = (await placementFn({ data: { planet, sign, house, lang } })) as Result;
      } else if (tab === "aspect") {
        res = (await aspectFn({
          data: {
            planetA: planet,
            planetB,
            aspect: aspect.label,
            angle: aspect.angle,
            lang,
          },
        })) as Result;
      } else if (tab === "synthesis") {
        res = (await synthesisFn({ data: { chart: SAMPLE_CHART, lang } })) as Result;
      } else {
        res = (await topicFn({ data: { chart: SAMPLE_CHART, topic, lang } })) as Result;
      }
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">Prompt Library v1.0</p>
          <h1 className="mt-3 text-4xl md:text-5xl">Αστρολογική Ερμηνεία</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Δομημένα prompts για atoms, όψεις, σύνθεση και θέματα εμβάθυνσης — χωρίς ελεύθερο
            κείμενο από τον χρήστη, με banned-term scan σε κάθε output.
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1">
          {(["el", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <nav className="mb-6 grid gap-2 sm:grid-cols-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setResult(null);
            }}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              tab === t.id
                ? "border-primary bg-secondary"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <span className="block text-sm font-medium">{t.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{t.hint}</span>
          </button>
        ))}
      </nav>

      <section className="panel p-6">
        {tab === "placement" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Πλανήτης" value={planet} onChange={setPlanet} options={PLANETS} />
            <Select label="Ζώδιο" value={sign} onChange={setSign} options={SIGNS} />
            <Select
              label="Οίκος"
              value={String(house)}
              onChange={(v) => setHouse(Number(v))}
              options={Array.from({ length: 12 }, (_, i) => String(i + 1))}
            />
          </div>
        )}

        {tab === "aspect" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Πλανήτης Α" value={planet} onChange={setPlanet} options={PLANETS} />
            <Select label="Πλανήτης Β" value={planetB} onChange={setPlanetB} options={PLANETS} />
            <Select
              label="Όψη"
              value={aspect.label}
              onChange={(v) => setAspect(ASPECTS.find((a) => a.label === v)!)}
              options={ASPECTS.map((a) => a.label)}
            />
          </div>
        )}

        {tab === "synthesis" && (
          <p className="text-sm text-muted-foreground">
            Τρέχει με το δείγμα χάρτη του contract (§6): μόνο υπολογισμένες θέσεις, χωρίς όνομα,
            ημερομηνία ή τόπο γέννησης. Temperature 0.4.
          </p>
        )}

        {tab === "topic" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Θέμα"
              value={topic}
              onChange={(v) => setTopic(v as Topic)}
              options={TOPICS}
            />
            <p className="self-end text-xs text-muted-foreground">
              Κλειστό enum — ο χρήστης δεν πληκτρολογεί ποτέ.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={run} disabled={loading}>
            {loading ? "Παράγεται…" : "Παραγωγή"}
          </Button>
          {error && <span className="text-sm text-destructive">Σφάλμα: {error}</span>}
        </div>
      </section>

      {result && (
        <section className="panel mt-6 p-6">
          {result.flagged ? (
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-destructive px-3 py-1 text-xs text-destructive-foreground">
                Χρειάζεται χειροκίνητο γράψιμο
              </span>
              <p className="text-sm text-muted-foreground">
                Το κείμενο περιείχε όρους εκτός πλαισίου
                {result.bannedTerms.length > 0 && ` (${result.bannedTerms.join(", ")})`} και δεν
                εμφανίζεται.
              </p>
            </div>
          ) : (
            <ResultView kind={tab} data={result.data} />
          )}
        </section>
      )}

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Το περιεχόμενο προορίζεται αποκλειστικά για ψυχαγωγία και αυτογνωσία.
      </footer>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
