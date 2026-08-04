import type { ChartJson } from "./types";

/**
 * Lightweight geocentric ephemeris (Paul Schlyter's low-precision formulas).
 * Accuracy ~1-2 arcminutes for the Sun/Moon and inner planets — plenty for
 * sign/house placements and aspect detection.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const SIGNS_EL = [
  "Κριός",
  "Ταύρος",
  "Δίδυμοι",
  "Καρκίνος",
  "Λέων",
  "Παρθένος",
  "Ζυγός",
  "Σκορπιός",
  "Τοξότης",
  "Αιγόκερως",
  "Υδροχόος",
  "Ιχθύες",
];

export const PLANET_NAMES_EL = [
  "Ήλιος",
  "Σελήνη",
  "Ερμής",
  "Αφροδίτη",
  "Άρης",
  "Δίας",
  "Κρόνος",
  "Ουρανός",
  "Ποσειδώνας",
  "Πλούτωνας",
] as const;

const norm = (x: number) => ((x % 360) + 360) % 360;
const sin = (d: number) => Math.sin(d * RAD);
const cos = (d: number) => Math.cos(d * RAD);

/** Στρογγυλοποίηση εκλειπτικού μήκους στο 2ο δεκαδικό — μία φορά, πριν από κάθε παραγωγή. */
const round2 = (lon: number) => norm(Math.round(norm(lon) * 100) / 100);

export function signOf(lon: number) {
  return SIGNS_EL[Math.floor(round2(lon) / 30)]!;
}

export function degreeInSign(lon: number) {
  return round2(lon) % 30;
}

/** Days since 2000 Jan 0.0 TT for a UTC timestamp. */
function daysSinceEpoch(utc: Date) {
  return utc.getTime() / 86400000 + 2440587.5 - 2451543.5;
}

interface Elements {
  N: number;
  i: number;
  w: number;
  a: number;
  e: number;
  M: number;
}

function elements(name: string, d: number): Elements {
  switch (name) {
    case "sun":
      return {
        N: 0,
        i: 0,
        w: 282.9404 + 4.70935e-5 * d,
        a: 1,
        e: 0.016709 - 1.151e-9 * d,
        M: 356.047 + 0.9856002585 * d,
      };
    case "moon":
      return {
        N: 125.1228 - 0.0529538083 * d,
        i: 5.1454,
        w: 318.0634 + 0.1643573223 * d,
        a: 60.2666,
        e: 0.0549,
        M: 115.3654 + 13.0649929509 * d,
      };
    case "mercury":
      return {
        N: 48.3313 + 3.24587e-5 * d,
        i: 7.0047 + 5.0e-8 * d,
        w: 29.1241 + 1.01444e-5 * d,
        a: 0.387098,
        e: 0.205635 + 5.59e-10 * d,
        M: 168.6562 + 4.0923344368 * d,
      };
    case "neptune":
      return {
        N: 131.7806 + 3.0173e-5 * d,
        i: 1.77 - 2.55e-7 * d,
        w: 272.8461 - 6.027e-6 * d,
        a: 30.05826 + 3.313e-8 * d,
        e: 0.008606 + 2.15e-9 * d,
        M: 260.2471 + 0.005995147 * d,
      };

    case "venus":
      return {
        N: 76.6799 + 2.4659e-5 * d,
        i: 3.3946 + 2.75e-8 * d,
        w: 54.891 + 1.38374e-5 * d,
        a: 0.72333,
        e: 0.006773 - 1.302e-9 * d,
        M: 48.0052 + 1.6021302244 * d,
      };
    case "mars":
      return {
        N: 49.5574 + 2.11081e-5 * d,
        i: 1.8497 - 1.78e-8 * d,
        w: 286.5016 + 2.92961e-5 * d,
        a: 1.523688,
        e: 0.093405 + 2.516e-9 * d,
        M: 18.6021 + 0.5240207766 * d,
      };
    case "jupiter":
      return {
        N: 100.4542 + 2.76854e-5 * d,
        i: 1.303 - 1.557e-7 * d,
        w: 273.8777 + 1.64505e-5 * d,
        a: 5.20256,
        e: 0.048498 + 4.469e-9 * d,
        M: 19.895 + 0.0830853001 * d,
      };
    case "saturn":
      return {
        N: 113.6634 + 2.3898e-5 * d,
        i: 2.4886 - 1.081e-7 * d,
        w: 339.3939 + 2.97661e-5 * d,
        a: 9.55475,
        e: 0.055546 - 9.499e-9 * d,
        M: 316.967 + 0.0334442282 * d,
      };
    case "uranus":
      return {
        N: 74.0005 + 1.3978e-5 * d,
        i: 0.7733 + 1.9e-8 * d,
        w: 96.6612 + 3.0565e-5 * d,
        a: 19.18171 - 1.55e-8 * d,
        e: 0.047318 + 7.45e-9 * d,
        M: 142.5905 + 0.011725806 * d,
      };
    default:
      return {
        N: 131.7806 + 3.0173e-5 * d,
        i: 1.77 - 2.55e-7 * d,
        w: 272.8461 - 6.027e-6 * d,
        a: 30.05826 + 3.313e-8 * d,
        e: 0.008606 + 2.15e-9 * d,
        M: 260.2471 + 0.005995147 * d,
      };
  }
}

/** Heliocentric (or geocentric for the Moon) rectangular ecliptic coords. */
function orbitalVector(el: Elements) {
  const M = norm(el.M);
  let E = M + el.e * DEG * sin(M) * (1 + el.e * cos(M));
  for (let i = 0; i < 8; i++) {
    E = E - (E - el.e * DEG * sin(E) - M) / (1 - el.e * cos(E));
  }
  const xv = el.a * (cos(E) - el.e);
  const yv = el.a * (Math.sqrt(1 - el.e * el.e) * sin(E));
  const v = norm(Math.atan2(yv, xv) * DEG);
  const r = Math.sqrt(xv * xv + yv * yv);
  const x = r * (cos(el.N) * cos(v + el.w) - sin(el.N) * sin(v + el.w) * cos(el.i));
  const y = r * (sin(el.N) * cos(v + el.w) + cos(el.N) * sin(v + el.w) * cos(el.i));
  const z = r * sin(v + el.w) * sin(el.i);
  return { x, y, z, r };
}

function sunLongitude(d: number) {
  const el = elements("sun", d);
  const M = norm(el.M);
  const E = M + el.e * DEG * sin(M) * (1 + el.e * cos(M));
  const xv = cos(E) - el.e;
  const yv = Math.sqrt(1 - el.e * el.e) * sin(E);
  const v = Math.atan2(yv, xv) * DEG;
  const r = Math.sqrt(xv * xv + yv * yv);
  return { lon: norm(v + el.w), r, M, w: el.w };
}

function moonLongitude(d: number) {
  const m = elements("moon", d);
  const { x, y } = orbitalVector(m);
  let lon = norm(Math.atan2(y, x) * DEG);
  const s = sunLongitude(d);
  const Ms = norm(s.M);
  const Ls = norm(s.M + s.w);
  const Mm = norm(m.M);
  const Lm = norm(m.N + m.w + m.M);
  const D = norm(Lm - Ls);
  const F = norm(Lm - m.N);
  lon +=
    -1.274 * sin(Mm - 2 * D) +
    0.658 * sin(2 * D) -
    0.186 * sin(Ms) -
    0.059 * sin(2 * Mm - 2 * D) -
    0.057 * sin(Mm - 2 * D + Ms) +
    0.053 * sin(Mm + 2 * D) +
    0.046 * sin(2 * D - Ms) +
    0.041 * sin(Mm - Ms) -
    0.035 * sin(D) -
    0.031 * sin(Mm + Ms) -
    0.015 * sin(2 * F - 2 * D) +
    0.011 * sin(Mm - 4 * D);
  return norm(lon);
}

function geocentricLongitude(name: string, d: number) {
  const p = orbitalVector(elements(name, d));
  const s = sunLongitude(d);
  const xs = s.r * cos(s.lon);
  const ys = s.r * sin(s.lon);
  return norm(Math.atan2(p.y + ys, p.x + xs) * DEG);
}

/** Pluto — Schlyter's special approximation, valid ~1800-2100. */
function plutoLongitude(d: number) {
  const S = 50.03 + 0.033459652 * d;
  const P = 238.95 + 0.003968789 * d;

  const lonecl =
    238.9508 +
    0.00400703 * d -
    19.799 * sin(P) +
    19.848 * cos(P) +
    0.897 * sin(2 * P) -
    4.956 * cos(2 * P) +
    0.61 * sin(3 * P) +
    1.211 * cos(3 * P) -
    0.341 * sin(4 * P) -
    0.19 * cos(4 * P) +
    0.128 * sin(5 * P) -
    0.034 * cos(5 * P) -
    0.038 * sin(6 * P) +
    0.031 * cos(6 * P) +
    0.02 * sin(S - P) -
    0.01 * cos(S - P);

  const latecl =
    -3.9082 -
    5.453 * sin(P) -
    14.975 * cos(P) +
    3.527 * sin(2 * P) +
    1.673 * cos(2 * P) -
    1.051 * sin(3 * P) +
    0.328 * cos(3 * P) +
    0.179 * sin(4 * P) -
    0.292 * cos(4 * P) +
    0.019 * sin(5 * P) +
    0.1 * cos(5 * P) -
    0.031 * sin(6 * P) -
    0.026 * cos(6 * P) +
    0.011 * cos(S - P);

  const r =
    40.72 +
    6.68 * sin(P) +
    6.9 * cos(P) -
    1.18 * sin(2 * P) -
    0.03 * cos(2 * P) +
    0.15 * sin(3 * P) -
    0.14 * cos(3 * P);

  const x = r * cos(lonecl) * cos(latecl);
  const y = r * sin(lonecl) * cos(latecl);
  const s = sunLongitude(d);
  return norm(Math.atan2(y + s.r * sin(s.lon), x + s.r * cos(s.lon)) * DEG);
}

function longitudes(d: number): number[] {
  return [
    sunLongitude(d).lon,
    moonLongitude(d),
    geocentricLongitude("mercury", d),
    geocentricLongitude("venus", d),
    geocentricLongitude("mars", d),
    geocentricLongitude("jupiter", d),
    geocentricLongitude("saturn", d),
    geocentricLongitude("uranus", d),
    geocentricLongitude("neptune", d),
    plutoLongitude(d),
  ];
}

function angles(d: number, lat: number, lon: number) {
  const s = sunLongitude(d);
  const Ls = norm(s.M + s.w);
  const gmst0 = norm(Ls + 180) / 15; // hours
  const ut = ((d % 1) + 1) % 1; // fraction of day (UT)
  const lst = norm((gmst0 + ut * 24 + lon / 15) * 15); // degrees
  const ecl = 23.4393 - 3.563e-7 * d;
  let mc = norm(Math.atan2(sin(lst), cos(lst) * cos(ecl)) * DEG);
  let asc = norm(Math.atan2(cos(lst), -(sin(lst) * cos(ecl) + Math.tan(lat * RAD) * sin(ecl))) * DEG);
  if (norm(asc - mc) > 180) asc = norm(asc + 180);
  return { asc, mc };
}

const ASPECT_DEFS: Array<{ type: string; angle: number; orb: number }> = [
  { type: "σύνοδος", angle: 0, orb: 8 },
  { type: "εξάγωνο", angle: 60, orb: 5 },
  { type: "τετράγωνο", angle: 90, orb: 7 },
  { type: "τρίγωνο", angle: 120, orb: 7 },
  { type: "αντίθεση", angle: 180, orb: 8 },
];

const ELEMENT_OF = ["fire", "earth", "air", "water"] as const;
const MODALITY_OF = ["cardinal", "fixed", "mutable"] as const;

export interface BirthInput {
  /** Local civil date/time at the birth place. */
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  /** Offset from UTC in hours at that moment (e.g. 2 for Athens summer). */
  utcOffsetHours: number;
}

export function computeChart(input: BirthInput): ChartJson {
  const utcMs =
    Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0) - input.utcOffsetHours * 3600000;
  const d = daysSinceEpoch(new Date(utcMs));
  const lons = longitudes(d);
  const prev = longitudes(d - 1);
  const { asc, mc } = angles(d, input.latitude, input.longitude);
  const ascSignIndex = Math.floor(norm(asc) / 30);

  const planets = lons.map((lon, i) => {
    const signIndex = Math.floor(norm(lon) / 30);
    let delta = norm(lon - prev[i]!);
    if (delta > 180) delta -= 360;
    return {
      name: PLANET_NAMES_EL[i]!,
      lon: norm(lon),
      sign: SIGNS_EL[signIndex]!,
      degree: degreeInSign(lon),
      house: ((signIndex - ascSignIndex + 12) % 12) + 1,
      retrograde: i > 1 && delta < 0,
    };
  });

  const aspects: ChartJson["aspects"] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(norm(planets[i]!.lon - planets[j]!.lon));
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            a: planets[i]!.name,
            b: planets[j]!.name,
            type: def.type,
            angle: def.angle,
            orb: Math.round(orb * 100) / 100,
            applying: diff < def.angle,
          });
          break;
        }
      }
    }
  }

  const elementsCount = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of planets) {
    const idx = SIGNS_EL.indexOf(p.sign);
    elementsCount[ELEMENT_OF[idx % 4]!] += 1;
    modalities[MODALITY_OF[idx % 3]!] += 1;
  }

  return {
    chartHash: `local:${utcMs}:${input.latitude.toFixed(2)}:${input.longitude.toFixed(2)}`,
    houseSystem: "whole_sign",
    angles: {
      asc: { sign: signOf(asc), degree: degreeInSign(asc) },
      mc: { sign: signOf(mc), degree: degreeInSign(mc) },
    },
    planets: planets.map(({ lon: _lon, ...rest }) => rest),
    aspects,
    balance: { elements: elementsCount, modalities },
  };
}

export const SIGNS = SIGNS_EL;
