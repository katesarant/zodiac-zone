import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const periodSchema = z.enum(["daily", "month", "year"]);
const langSchema = z.enum(["el", "en"]);

const readingSchema = z.object({
  lang: langSchema,
  period: periodSchema,
  signIndex: z.number().int().min(0).max(11),
  key: z.string().min(4).max(10).optional(),
});

/** Static read of a pre-generated file. Never triggers an AI call. */
export const getReadingFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => readingSchema.parse(input))
  .handler(async ({ data }) => {
    const { loadFile } = await import("./files.server");
    const file = await loadFile(data.period, data.lang, data.key);
    const reading = file?.signs[data.signIndex] ?? null;
    return {
      key: file?.key ?? null,
      generatedAt: file?.generatedAt ?? null,
      requestedKey: data.key ?? null,
      isFallback: Boolean(file && data.key && file.key !== data.key),
      reading,
    };
  });

/** Latest available daily key + the readings for all 12 signs (index page). */
export const getIndexFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ lang: langSchema }).parse(input))
  .handler(async ({ data }) => {
    const { loadFile } = await import("./files.server");
    const file = await loadFile("daily", data.lang);
    return { key: file?.key ?? null, generatedAt: file?.generatedAt ?? null };
  });

/** Every daily key available, newest first — used by the sitemap. */
export const listArchiveFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ lang: langSchema }).parse(input))
  .handler(async ({ data }) => {
    const { listKeys } = await import("./files.server");
    return { keys: await listKeys("daily", data.lang) };
  });
