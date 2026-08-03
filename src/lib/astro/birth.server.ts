import { computeChart } from "./engine";
import type { ChartJson } from "./types";

export interface BirthResolved {
  chart: ChartJson;
  place: { name: string; country: string; latitude: number; longitude: number; timezone: string };
  local: { date: string; time: string; utcOffsetHours: number };
}

/** UTC offset (in hours) of an IANA timezone at a given UTC instant. */
function offsetHours(timeZone: string, utcDate: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(utcDate).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  const asUTC = Date.UTC(
    Number(parts["year"]),
    Number(parts["month"]) - 1,
    Number(parts["day"]),
    Number(parts["hour"]) % 24,
    Number(parts["minute"]),
    Number(parts["second"]),
  );
  return (asUTC - utcDate.getTime()) / 3600000;
}

export async function geocodeAndCompute(input: {
  date: string;
  time: string;
  place: string;
}): Promise<BirthResolved> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    input.place,
  )}&count=1&language=el&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("geocoding_failed");
  const json = (await res.json()) as {
    results?: Array<{
      name: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }>;
  };
  const hit = json.results?.[0];
  if (!hit) throw new Error("place_not_found");

  const [y, m, d] = input.date.split("-").map(Number) as [number, number, number];
  const [hh, mm] = input.time.split(":").map(Number) as [number, number];
  const timezone = hit.timezone ?? "UTC";

  // Two-pass offset resolution (handles DST boundaries).
  let guess = Date.UTC(y, m - 1, d, hh, mm);
  let off = offsetHours(timezone, new Date(guess));
  off = offsetHours(timezone, new Date(guess - off * 3600000));

  const chart = computeChart({
    year: y,
    month: m,
    day: d,
    hour: hh,
    minute: mm,
    latitude: hit.latitude,
    longitude: hit.longitude,
    utcOffsetHours: off,
  });

  return {
    chart,
    place: {
      name: hit.name,
      country: hit.country ?? "",
      latitude: hit.latitude,
      longitude: hit.longitude,
      timezone,
    },
    local: { date: input.date, time: input.time, utcOffsetHours: off },
  };
}
