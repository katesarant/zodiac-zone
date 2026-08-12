import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LIMITED = { data: null, flagged: false, bannedTerms: [], attempts: 0, cached: false, limited: true } as const;

async function limited(): Promise<boolean> {
  const { allowGeneration } = await import("./rate-limit.server");
  return !(await allowGeneration());
}

const langSchema = z.enum(["el", "en"]);

const placementSchema = z.object({
  planet: planetEnum,
  sign: signEnum,
  house: houseSchema,
  lang: langSchema,
});

const aspectSchema = z
  .object({
    planetA: planetEnum,
    planetB: planetEnum,
    aspect: aspectEnum,
    angle: z.number(),
    lang: langSchema,
  })
  .refine((v) => ASPECT_ANGLE[v.aspect] === v.angle, { message: "aspect_angle_mismatch" });

const chartSchema = z.object({ chart: chartJsonSchema, lang: langSchema });


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


