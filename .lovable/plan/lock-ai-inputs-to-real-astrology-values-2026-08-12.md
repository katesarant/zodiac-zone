# Lock AI inputs to real astrology values

The generation endpoints currently accept any text for planet, sign and aspect, and accept the chart object almost unchecked. That text goes straight into the AI prompt, and synthesis results are stored in the shared, publicly readable interpretation cache. Someone could send fake "planet" text containing instructions and get manipulated content saved and served as a real reading.

## What changes

1. A single shared allow-list module holds the only accepted values:
   - 12 signs (Κριός … Ιχθύες)
   - 10 planets (Ήλιος … Πλούτωνας)
   - 5 aspect types (σύνοδος, εξάγωνο, τετράγωνο, τρίγωνο, αντίθεση) with their fixed angles
   - house 1-12, degree 0-360, orb 0-15
2. The three generation endpoints validate against those lists and reject anything else with a clear error, before any prompt is built.
3. The chart payload is fully validated: every planet entry, both angles, every aspect, and the element/modality balance must match the allow-lists and numeric ranges. Unknown or extra text fields are dropped rather than passed through.
4. The chart used for the prompt and for the cache key is the re-built, validated object — never the raw client payload — so nothing unvalidated can reach the AI or the cache.
5. The UI shows a friendly message (both Greek and English) if the server rejects the input; normal use is unaffected because the dropdowns only ever send valid values.

## Technical notes

- New `src/lib/astro/vocab.ts`: exported `SIGNS`, `PLANETS`, `ASPECTS` (label + angle) arrays plus zod enums built from them. Values come from the existing lists in `src/lib/astro/engine.ts` so there is one source of truth.
- `src/lib/astro/interpretation.functions.ts`: replace `z.string().min(1)` with the enums in `placementSchema` and `aspectSchema`; replace `chart: z.unknown()` with a strict `chartSchema` (zod object, `.strict()` on nested entries, angle cross-checked against the aspect label).
- `src/lib/astro/chart.ts`: `toChartJson` becomes a zod-backed parse returning a normalised `ChartJson`; keeps throwing `invalid_chart_contract` on failure so existing error handling still works.
- `generateSynthesisFn` computes `contentKey` and calls `generateSynthesis` with the parsed chart object.
- i18n: add `errInvalidInput` to both `el` and `en` in `src/lib/astro/i18n.ts`; `StudioPage` maps a validation error to it.
- No schema, RLS or theme changes; the banned-word filter stays as a second layer.
