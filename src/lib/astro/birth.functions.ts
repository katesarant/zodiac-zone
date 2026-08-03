import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const birthSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  place: z.string().min(2).max(120),
});

export const buildChartFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => birthSchema.parse(input))
  .handler(async ({ data }) => {
    const { geocodeAndCompute } = await import("./birth.server");
    return geocodeAndCompute(data);
  });
