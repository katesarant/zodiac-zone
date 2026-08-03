import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const topicSchema = z.object({
  chart: z.unknown(),
  lang: langSchema,
  topic: z.enum([
    "relationships",
    "career",
    "communication",
    "emotional_needs",
    "strengths",
    "blind_spots",
  ]),
});

export const generatePlacementAtomFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => placementSchema.parse(input))
  .handler(async ({ data }) => {
    const { generatePlacementAtom } = await import("./generate.server");
    const { lang, ...placement } = data;
    return generatePlacementAtom(placement, lang);
  });

export const generateAspectAtomFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => aspectSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateAspectAtom } = await import("./generate.server");
    const { lang, ...aspect } = data;
    return generateAspectAtom(aspect, lang);
  });

export const generateSynthesisFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chartSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateSynthesis } = await import("./generate.server");
    const { toChartJson } = await import("./chart");
    return generateSynthesis(toChartJson(data.chart), [], data.lang);
  });

export const generateTopicFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => topicSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateTopic } = await import("./generate.server");
    const { toChartJson } = await import("./chart");
    return generateTopic(toChartJson(data.chart), data.topic, data.lang);
  });
