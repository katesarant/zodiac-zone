import type { ChartJson } from "./types";

/** Runtime validation of the engine → AI contract (§6). */
export function toChartJson(value: unknown): ChartJson {
  const chart = value as ChartJson;
  if (
    !chart ||
    typeof chart !== "object" ||
    typeof chart.chartHash !== "string" ||
    !Array.isArray(chart.planets) ||
    !Array.isArray(chart.aspects) ||
    !chart.angles
  ) {
    throw new Error("invalid_chart_contract");
  }
  return chart;
}

/** Example payload matching the contract — used by the studio page. */
export const SAMPLE_CHART: ChartJson = {
  chartHash: "sha256:demo-0001",
  houseSystem: "placidus",
  angles: {
    asc: { sign: "Λέων", degree: 14.2 },
    mc: { sign: "Ταύρος", degree: 3.8 },
  },
  planets: [
    { name: "Ήλιος", sign: "Παρθένος", degree: 22.4, house: 2, retrograde: false },
    { name: "Σελήνη", sign: "Ιχθύες", degree: 8.1, house: 8, retrograde: false },
    { name: "Ερμής", sign: "Ζυγός", degree: 3.6, house: 3, retrograde: true },
    { name: "Αφροδίτη", sign: "Λέων", degree: 27.9, house: 1, retrograde: false },
    { name: "Άρης", sign: "Σκορπιός", degree: 11.4, house: 4, retrograde: false },
    { name: "Κρόνος", sign: "Αιγόκερως", degree: 19.7, house: 6, retrograde: false },
    { name: "Πλούτωνας", sign: "Σκορπιός", degree: 2.2, house: 4, retrograde: true },
  ],
  aspects: [
    { a: "Ήλιος", b: "Κρόνος", type: "τετράγωνο", angle: 90, orb: 2.1, applying: true },
    { a: "Σελήνη", b: "Άρης", type: "τρίγωνο", angle: 120, orb: 3.3, applying: false },
    { a: "Αφροδίτη", b: "Πλούτωνας", type: "αντίθεση", angle: 180, orb: 1.4, applying: true },
  ],
  balance: {
    elements: { fire: 2, earth: 4, air: 1, water: 3 },
    modalities: { cardinal: 3, fixed: 5, mutable: 2 },
  },
};
