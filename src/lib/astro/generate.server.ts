import { RETRY_INSTRUCTION, scanResult } from "./banned-filter";
import {
  p1Placement,
  p1PlacementBatch,
  p2Aspect,
  p3Synthesis,
  p5Horoscope,
  sysBase,
  sysHoroscope,
  TEMPERATURE,
} from "./prompts";
import type {
  AspectInput,
  AtomAspect,
  AtomPlacement,
  ChartJson,
  Horoscope,
  HoroscopePeriod,
  Lang,
  PlacementInput,
  Synthesis,
} from "./types";
import { tAspect, tPlanet, tSign } from "./i18n";

/** Localises the astrological vocabulary sent to the model (Greek data → English for EN). */
function locPlacement(p: PlacementInput, lang: Lang): PlacementInput {
  return { ...p, planet: tPlanet(p.planet, lang), sign: tSign(p.sign, lang) };
}

function locAspect(a: AspectInput, lang: Lang): AspectInput {
  return {
    ...a,
    planetA: tPlanet(a.planetA, lang),
    planetB: tPlanet(a.planetB, lang),
    aspect: tAspect(a.aspect, lang),
  };
}

function locChart(chart: ChartJson, lang: Lang): ChartJson {
  if (lang !== "en") return chart;
  return {
    ...chart,
    angles: {
      asc: { ...chart.angles.asc, sign: tSign(chart.angles.asc.sign, lang) },
      mc: { ...chart.angles.mc, sign: tSign(chart.angles.mc.sign, lang) },
    },
    planets: chart.planets.map((p) => ({
      ...p,
      name: tPlanet(p.name, lang),
      sign: tSign(p.sign, lang),
    })),
    aspects: chart.aspects.map((a) => ({
      ...a,
      a: tPlanet(a.a, lang),
      b: tPlanet(a.b, lang),
      type: tAspect(a.type, lang),
    })),
  };
}

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

export class AstroAiError extends Error {}

/** Strips stray fences and trailing commas before parsing (§7 JSON-repair). */
function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start === -1 || end === -1) throw new AstroAiError("unparseable_model_output");
    const slice = cleaned.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(slice) as T;
  }
}

async function callGateway(
  system: string,
  user: string,
  temperature: number,
  runId?: string,
): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AstroAiError("missing_api_key");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new AstroAiError("rate_limited");
  if (res.status === 402) throw new AstroAiError("credits_exhausted");
  if (!res.ok) throw new AstroAiError(`gateway_error_${res.status}`);

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new AstroAiError("empty_model_output");
  return content;
}

export interface GenerationResult<T> {
  data: T | null;
  flagged: boolean;
  bannedTerms: string[];
  attempts: number;
}

/**
 * One generation unit: call → JSON repair → banned-term scan → one retry →
 * flag for manual writing (§8).
 */
async function generate<T>(
  lang: Lang,
  userPrompt: string,
  temperature: number,
  systemPrompt?: string,
): Promise<GenerationResult<T>> {
  const system = systemPrompt ?? sysBase(lang);
  let bannedTerms: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt = attempt === 1 ? userPrompt : `${userPrompt}\n\n${RETRY_INSTRUCTION}`;
    const raw = await callGateway(system, prompt, temperature);
    const parsed = parseJson<T>(raw);
    bannedTerms = scanResult(parsed, lang);
    if (bannedTerms.length === 0) {
      return { data: parsed, flagged: false, bannedTerms: [], attempts: attempt };
    }
  }

  return { data: null, flagged: true, bannedTerms, attempts: 2 };
}

export function generatePlacementAtom(placement: PlacementInput, lang: Lang) {
  return generate<AtomPlacement>(lang, p1Placement(locPlacement(placement, lang)), TEMPERATURE.atom);
}

export function generatePlacementAtomBatch(
  planet: string,
  sign: string,
  houses: number[],
  lang: Lang,
) {
  return generate<AtomPlacement[]>(lang, p1PlacementBatch(tPlanet(planet, lang), tSign(sign, lang), houses), TEMPERATURE.atom);
}

export function generateAspectAtom(aspect: AspectInput, lang: Lang) {
  return generate<AtomAspect>(lang, p2Aspect(locAspect(aspect, lang)), TEMPERATURE.atom);
}

export function generateSynthesis(chart: ChartJson, atoms: unknown, lang: Lang) {
  return generate<Synthesis>(lang, p3Synthesis(locChart(chart, lang), atoms), TEMPERATURE.synthesis);
}

/** Horoscope for one sign/period — same banned-filter gate as chart readings. */
export function generateHoroscope(
  input: { sign: string; period: HoroscopePeriod; date: string; sky: unknown },
  lang: Lang,
) {
  return generate<Horoscope>(
    lang,
    p5Horoscope(input),
    TEMPERATURE.horoscope,
    sysHoroscope(lang),
  );
}
