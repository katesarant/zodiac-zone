export type Lang = "el" | "en";

export interface PlacementInput {
  planet: string;
  sign: string;
  house: number;
}

export interface AspectInput {
  planetA: string;
  planetB: string;
  aspect: string;
  angle: number;
}

export interface AtomPlacement {
  planet: string;
  sign: string;
  house: number;
  core: string;
  arena: string;
  growth: string;
  keywords: string[];
}

export interface AtomAspect {
  planet_a: string;
  planet_b: string;
  aspect: string;
  dynamic: string;
  shows_up: string;
  work: string;
  intensity: "low" | "medium" | "high";
}

export interface Synthesis {
  signature: string;
  strengths: string[];
  tensions: string[];
  life_areas: {
    relationships: string;
    work: string;
    inner_life: string;
  };
  one_thing: string;
}

/** Contract between the astrology engine and the AI layer (§6). */
export interface ChartJson {
  chartHash: string;
  houseSystem: "placidus" | "whole_sign";
  angles: {
    asc: { sign: string; degree: number };
    mc: { sign: string; degree: number };
  };
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house: number;
    retrograde: boolean;
  }>;
  aspects: Array<{
    a: string;
    b: string;
    type: string;
    angle: number;
    orb: number;
    applying: boolean;
  }>;
  balance: {
    elements: { fire: number; earth: number; air: number; water: number };
    modalities: { cardinal: number; fixed: number; mutable: number };
  };
}

/** Cache keys (§0). */
export const cacheKeys = {
  atom: (planet: string, sign: string, house: number, lang: Lang) =>
    `atom:${planet}:${sign}:${house}:${lang}`,
  aspect: (a: string, aspect: string, b: string, lang: Lang) => `asp:${a}:${aspect}:${b}:${lang}`,
  synthesis: (chartHash: string, lang: Lang) => `synth:${chartHash}:${lang}`,
};
