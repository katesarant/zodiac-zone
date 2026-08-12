import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LIMITED = { data: null, flagged: false, bannedTerms: [], attempts: 0, cached: false, limited: true } as const;

async function limited(): Promise<boolean> {
  const { allowGeneration } = await import("./rate-limit.server");
  return !(await allowGeneration());
}

const langSchema = z.enum(["el", "en"]);

const placementSchema = z.object({
  planet: z.string().min(1),
  sign: z.string().min(1),
  house: z.number().int().min(1).max(12),
  lang: langSchema,
});

const aspectSchema = z.object({
  planetA: z.string().min(1),
  planetB: z.string().min(1),
  aspect: z.string().min(1),
  angle: z.number(),
  lang: langSchema,
});

const chartSchema = z.object({ chart: z.unknown(), lang: langSchema });

export const generatePlacementAtomFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placementSchema.parse(input))
  .handler(async ({ data }) => {
    if (await limited()) return LIMITED;
    const { generatePlacementAtom } = await import("./generate.server");
    const { lang, ...placement } = data;
    return generatePlacementAtom(placement, lang);
  });

export const generateAspectAtomFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => aspectSchema.parse(input))
  .handler(async ({ data }) => {
    if (await limited()) return LIMITED;
    const { generateAspectAtom } = await import("./generate.server");
    const { lang, ...aspect } = data;
    return generateAspectAtom(aspect, lang);
  });

export const generateSynthesisFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chartSchema.parse(input))
  .handler(async ({ data }) => {
    if (await limited()) return LIMITED;
    const { generateSynthesis } = await import("./generate.server");
    const { toChartJson } = await import("./chart");
    const { contentKey, readCache, writeCache } = await import("./cache.server");

    const chart = toChartJson(data.chart);
    const key = await contentKey(chart);
    const hit = await readCache<unknown>(key, data.lang, "synthesis");
    if (hit) return { data: hit, flagged: false, bannedTerms: [], attempts: 0, cached: true };

    const result = await generateSynthesis(chart, [], data.lang);
    if (!result.flagged && result.data) {
      await writeCache(key, data.lang, "synthesis", result.data);
    }
    return { ...result, cached: false };
  });


