import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { ChartTables, ChartWheel } from "@/components/astro/ChartWheel";
import { DatePicker } from "@/components/astro/DatePicker";
import { ResultView } from "@/components/astro/ResultView";
import { TimePicker } from "@/components/astro/TimePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLang } from "@/hooks/use-lang";
import { saveChart } from "@/lib/storage/local-library";
import { buildChartFn } from "@/lib/astro/birth.functions";
import { SAMPLE_CHART } from "@/lib/astro/chart";
import {
  generateAspectAtomFn,
  generatePlacementAtomFn,
  generateSynthesisFn,
  generateTopicFn,
} from "@/lib/astro/interpretation.functions";
import { dict, tAspect, tPlanet, tSign } from "@/lib/astro/i18n";
import { TOPICS, type ChartJson, type Lang, type Topic } from "@/lib/astro/types";
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

const TAB_IDS: Tab[] = ["placement", "aspect", "synthesis", "topic"];

const field =
  "w-full rounded-lg border border-input bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

type Result = {
  data: unknown;
  flagged: boolean;
  bannedTerms: string[];
  attempts: number;
  cached?: boolean;
  limited?: boolean;
};

export function StudioPage({ initialLang = "el" }: { initialLang?: Lang }) {
  const [lang] = useLang(initialLang);
  const [tab, setTab] = useState<Tab>("placement");
  const [planet, setPlanet] = useState(PLANETS[0]!);
  const [sign, setSign] = useState(SIGNS[0]!);
  const [house, setHouse] = useState(1);
  const [planetB, setPlanetB] = useState(PLANETS[6]!);
  const [aspect, setAspect] = useState(ASPECTS[2]!);
  const [topic, setTopic] = useState<Topic>("relationships");
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState("Αθήνα");
  const [chartName, setChartName] = useState("");
  const [chartLabelName, setChartLabelName] = useState<string | null>(null);
  const [chart, setChart] = useState<ChartJson | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [placeInfo, setPlaceInfo] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const placementFn = useServerFn(generatePlacementAtomFn);
  const aspectFn = useServerFn(generateAspectAtomFn);
  const synthesisFn = useServerFn(generateSynthesisFn);
  const topicFn = useServerFn(generateTopicFn);
  const chartFn = useServerFn(buildChartFn);

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
        const built = (await chartFn({
          data: { date: birthDate, time: birthTime, place: birthPlace },
        })) as {
          chart: ChartJson;
          place: { name: string; country: string; latitude: number; longitude: number; timezone: string };
          local: { utcOffsetHours: number };
        };
        setChart(built.chart);
        setChartLabelName(chartName.trim() || null);
        setPlaceInfo({
          name: built.place.name,
          latitude: built.place.latitude,
          longitude: built.place.longitude,
          timezone: built.place.timezone,
        });
        setPlaceLabel(
          `${built.place.name}${built.place.country ? `, ${built.place.country}` : ""} · ${built.place.timezone} (UTC${built.local.utcOffsetHours >= 0 ? "+" : ""}${built.local.utcOffsetHours})`,
        );
        res = (await synthesisFn({ data: { chart: built.chart, lang } })) as Result;
      } else {
        res = (await topicFn({ data: { chart: chart ?? SAMPLE_CHART, topic, lang } })) as Result;
      }
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  const t = dict(lang);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{t.eyebrow}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{t.title}</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t.intro}</p>
        </div>
      </header>

      <nav data-print-hide className="mb-6 grid gap-2 sm:grid-cols-4">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setResult(null);
            }}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              tab === id ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <span className="block text-sm font-medium">{t.tabs[id].label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{t.tabs[id].hint}</span>
          </button>
        ))}
      </nav>

      <section className="panel p-6" data-print-hide>
        {tab === "placement" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label={t.planet}
              value={planet}
              onChange={setPlanet}
              options={PLANETS}
              render={(v) => tPlanet(v, lang)}
            />
            <Select label={t.sign} value={sign} onChange={setSign} options={SIGNS} render={(v) => tSign(v, lang)} />
            <Select
              label={t.house}
              value={String(house)}
              onChange={(v) => setHouse(Number(v))}
              options={Array.from({ length: 12 }, (_, i) => String(i + 1))}
            />
          </div>
        )}

        {tab === "aspect" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label={t.planetA}
              value={planet}
              onChange={setPlanet}
              options={PLANETS}
              render={(v) => tPlanet(v, lang)}
            />
            <Select
              label={t.planetB}
              value={planetB}
              onChange={setPlanetB}
              options={PLANETS}
              render={(v) => tPlanet(v, lang)}
            />
            <Select
              label={t.aspect}
              value={aspect.label}
              onChange={(v) => setAspect(ASPECTS.find((a) => a.label === v)!)}
              options={ASPECTS.map((a) => a.label)}
              render={(v) => tAspect(v, lang)}
            />
          </div>
        )}

        {tab === "synthesis" && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                {t.chartName}
              </span>
              <input
                type="text"
                className={field}
                value={chartName}
                placeholder={t.namePlaceholder}
                onChange={(e) => setChartName(e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                  {t.birthDate}
                </span>
                <DatePicker value={birthDate} onChange={setBirthDate} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                  {t.birthTime}
                </span>
                <TimePicker value={birthTime} onChange={setBirthTime} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                  {t.birthPlace}
                </span>
                <input
                  type="text"
                  className={field}
                  value={birthPlace}
                  placeholder={t.placePlaceholder}
                  onChange={(e) => setBirthPlace(e.target.value)}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{t.chartNote}</p>
          </div>
        )}

        {tab === "topic" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t.topic}
              value={topic}
              onChange={(v) => setTopic(v as Topic)}
              options={TOPICS}
              render={(v) => t.topics[v as Topic]}
            />
            <p className="self-end text-xs text-muted-foreground">{t.topicNote}</p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={run} disabled={loading}>
            {loading ? t.generating : t.generate}
          </Button>
          {error && (
            <span className="text-sm text-destructive">
              {t.error}: {error}
            </span>
          )}
        </div>
      </section>

      {tab === "synthesis" && chart && (
        <section className="panel mt-6 p-6">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl">{chartLabelName ?? t.chartTitle}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {[placeLabel, `${birthDate} · ${birthTime}`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2" data-print-hide>
              <Button
                variant="outline"
                onClick={() => {
                  const year = birthDate.slice(0, 4);
                  const base = placeInfo?.name ?? birthPlace;
                  setSaveLabel(chartLabelName ?? `${base} ${year}`.trim());
                  setSaveOpen(true);
                }}
              >
                {t.library.saveChart}
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                {t.library.pdfLabel}
              </Button>
            </div>
          </header>
          <ChartWheel chart={chart} />
          <div className="mt-8">
            <ChartTables chart={chart} lang={lang} />
          </div>
        </section>
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.library.saveDialogTitle}</DialogTitle>
            <DialogDescription>{t.library.saveDialogBody}</DialogDescription>
          </DialogHeader>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
              {t.library.label}
            </span>
            <input type="text" className={field} value={saveLabel} onChange={(e) => setSaveLabel(e.target.value)} />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              {t.library.cancel}
            </Button>
            <Button
              disabled={!saveLabel.trim() || !chart}
              onClick={() => {
                if (!chart) return;
                saveChart({
                  label: saveLabel.trim(),
                  birthDate,
                  birthTime,
                  birthPlace: placeInfo?.name ?? birthPlace,
                  lat: placeInfo?.latitude ?? 0,
                  lon: placeInfo?.longitude ?? 0,
                  tz: placeInfo?.timezone ?? "UTC",
                  chartJson: chart,
                });
                setSaveOpen(false);
              }}
            >
              {t.library.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {result && (
        <section className="panel mt-6 p-6">
          {result.limited ? (
            <p className="text-sm text-muted-foreground">{t.library.limitReached}</p>
          ) : result.flagged ? (
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-destructive px-3 py-1 text-xs text-destructive-foreground">
                {t.flagged}
              </span>
              <p className="text-sm text-muted-foreground">
                {t.flaggedBody}
                {result.bannedTerms.length > 0 && ` (${result.bannedTerms.join(", ")})`} {t.flaggedTail}
              </p>
            </div>
          ) : (
            <>
              <h2 className="mb-5 text-2xl">{tab === "synthesis" ? t.analysis : t.interpretation}</h2>
              <ResultView kind={tab} data={result.data} lang={lang} />
            </>
          )}
        </section>
      )}

      <footer className="mt-10 text-center text-xs text-muted-foreground">{t.footer}</footer>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  render?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}
