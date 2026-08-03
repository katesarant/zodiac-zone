import { RETRY_INSTRUCTION, scanResult } from "./banned-filter";
import {
  p1Placement,
  p1PlacementBatch,
  p2Aspect,
  p3Synthesis,
  p4Topic,
  sysBase,
  TEMPERATURE,
} from "./prompts";
import type {
  AspectInput,
  AtomAspect,
  AtomPlacement,
  ChartJson,
  Lang,
  PlacementInput,
  Synthesis,
  Topic,
  TopicExpansion,
} from "./types";
import { TOPICS } from "./types";

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
): Promise<GenerationResult<T>> {
  const system = sysBase(lang);
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
  return generate<AtomPlacement>(lang, p1Placement(placement), TEMPERATURE.atom);
}

export function generatePlacementAtomBatch(
  planet: string,
  sign: string,
  houses: number[],
  lang: Lang,
) {
  return generate<AtomPlacement[]>(lang, p1PlacementBatch(planet, sign, houses), TEMPERATURE.atom);
}

export function generateAspectAtom(aspect: AspectInput, lang: Lang) {
  return generate<AtomAspect>(lang, p2Aspect(aspect), TEMPERATURE.atom);
}

export function generateSynthesis(chart: ChartJson, atoms: unknown, lang: Lang) {
  return generate<Synthesis>(lang, p3Synthesis(chart, atoms), TEMPERATURE.synthesis);
}

export function generateTopic(chart: ChartJson, topic: Topic, lang: Lang) {
  if (!TOPICS.includes(topic)) throw new AstroAiError("invalid_topic");
  return generate<TopicExpansion>(lang, p4Topic(chart, topic, lang), TEMPERATURE.synthesis);
}
