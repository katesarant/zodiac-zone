import { computeChart, SIGNS } from "./engine";

export type TransitPeriod = "month" | "year";

export interface SkyPlanet {
  name: string;
  sign: string;
  degree: number;
  lon: number;
  retrograde: boolean;
}

export interface SkySnapshot {
  /** UTC timestamp of the snapshot (always 12:00 UTC of the requested day). */
  utcMs: number;
  planets: SkyPlanet[];
  moonSign: string;
  moonPhase: string;
}

export interface SignTransit {
  planet: string;
  sign: string;
  degree: number;
  aspect: string;
  orb: number;
}

export interface SignTransits {
  sign: string;
  moonSign: string;
  moonPhase: string;
  transits: SignTransit[];
}

const ORB = 8;

const ASPECTS = [
  { type: "σύνοδος", angle: 0 },
  { type: "εξάγωνο", angle: 60 },
  { type: "τετράγωνο", angle: 90 },
  { type: "τρίγωνο", angle: 120 },
  { type: "αντίθεση", angle: 180 },
] as const;

export const PERIOD_PLANETS: Record<TransitPeriod, string[]> = {
  month: ["Ήλιος", "Ερμής", "Αφροδίτη", "Άρης", "Δίας", "Κρόνος"],
  year: ["Δίας", "Κρόνος", "Ουρανός", "Ποσειδώνας", "Πλούτωνας"],
};

const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Shortest angular separation between two ecliptic longitudes (0-180). */
export function separation(a: number, b: number): number {
  const diff = norm360(a - b);
  return diff > 180 ? 360 - diff : diff;
}

/** Major aspect (8° orb) between a longitude and a target point, or null. */
export function aspectTo(lon: number, target: number): { aspect: string; orb: number } | null {
  const diff = separation(lon, target);
  for (const def of ASPECTS) {
    const orb = Math.abs(diff - def.angle);
    if (orb <= ORB) return { aspect: def.type, orb: Math.round(orb * 100) / 100 };
  }
  return null;
}

/** Moon phase from the Sun→Moon elongation (0-360). */
export function moonPhaseFrom(sunLon: number, moonLon: number): string {
  const elong = norm360(moonLon - sunLon);
  if (elong < 15 || elong >= 345) return "νέα";
  if (elong < 165) return "αύξουσα";
  if (elong < 195) return "πανσέληνος";
  return "φθίνουσα";
}

/**
 * The sky for a given day, computed with the existing engine at 12:00 UTC
 * from lat 0 / lon 0. Houses and angles are discarded — they are meaningless
 * without a birth place; only planet positions are used.
 */
export async function skyForDate(date: Date): Promise<SkySnapshot> {
  const utcMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
  const at = new Date(utcMs);
  const chart = await computeChart({
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
    hour: 12,
    minute: 0,
    latitude: 0,
    longitude: 0,
    utcOffsetHours: 0,
  });

  const planets: SkyPlanet[] = chart.planets.map((p) => ({
    name: p.name,
    sign: p.sign,
    degree: p.degree,
    lon: norm360(SIGNS.indexOf(p.sign) * 30 + p.degree),
    retrograde: p.retrograde,
  }));

  const sun = planets.find((p) => p.name === "Ήλιος");
  const moon = planets.find((p) => p.name === "Σελήνη");

  return {
    utcMs,
    planets,
    moonSign: moon?.sign ?? SIGNS[0]!,
    moonPhase: sun && moon ? moonPhaseFrom(sun.lon, moon.lon) : "νέα",
  };
}

/**
 * Planets aspecting 0° of the given sign, filtered by period when provided.
 * signIndex: 0 = Κριός … 11 = Ιχθύες.
 */
export function transitsForSign(
  sky: SkySnapshot,
  signIndex: number,
  period?: TransitPeriod,
): SignTransits {
  const index = ((signIndex % 12) + 12) % 12;
  const target = index * 30;
  const allowed = period ? PERIOD_PLANETS[period] : null;

  const transits: SignTransit[] = [];
  for (const p of sky.planets) {
    if (allowed && !allowed.includes(p.name)) continue;
    const hit = aspectTo(p.lon, target);
    if (!hit) continue;
    transits.push({ planet: p.name, sign: p.sign, degree: p.degree, aspect: hit.aspect, orb: hit.orb });
  }
  transits.sort((a, b) => a.orb - b.orb);

  return {
    sign: SIGNS[index]!,
    moonSign: sky.moonSign,
    moonPhase: sky.moonPhase,
    transits,
  };
}
