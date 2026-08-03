import type { Lang } from "./types";

const SIGN_EN: Record<string, string> = {
  Κριός: "Aries",
  Ταύρος: "Taurus",
  Δίδυμοι: "Gemini",
  Καρκίνος: "Cancer",
  Λέων: "Leo",
  Παρθένος: "Virgo",
  Ζυγός: "Libra",
  Σκορπιός: "Scorpio",
  Τοξότης: "Sagittarius",
  Αιγόκερως: "Capricorn",
  Υδροχόος: "Aquarius",
  Ιχθύες: "Pisces",
};

const PLANET_EN: Record<string, string> = {
  Ήλιος: "Sun",
  Σελήνη: "Moon",
  Ερμής: "Mercury",
  Αφροδίτη: "Venus",
  Άρης: "Mars",
  Δίας: "Jupiter",
  Κρόνος: "Saturn",
  Ουρανός: "Uranus",
  Ποσειδώνας: "Neptune",
  Πλούτωνας: "Pluto",
};

const ASPECT_EN: Record<string, string> = {
  σύνοδος: "conjunction",
  εξάγωνο: "sextile",
  τετράγωνο: "square",
  τρίγωνο: "trine",
  αντίθεση: "opposition",
};

export const tSign = (v: string, lang: Lang) => (lang === "en" ? (SIGN_EN[v] ?? v) : v);
export const tPlanet = (v: string, lang: Lang) => (lang === "en" ? (PLANET_EN[v] ?? v) : v);
export const tAspect = (v: string, lang: Lang) => (lang === "en" ? (ASPECT_EN[v] ?? v) : v);

export function ordinalHouse(house: number, lang: Lang) {
  if (lang === "el") return `${house}ος οίκος`;
  const s = ["th", "st", "nd", "rd"];
  const v = house % 100;
  return `${house}${s[(v - 20) % 10] ?? s[v] ?? s[0]} house`;
}

const EL = {
  eyebrow: "Prompt Library v1.0",
  title: "Αστρολογική Ερμηνεία",
  intro:
    "Δομημένα prompts για atoms, όψεις, σύνθεση και θέματα εμβάθυνσης — χωρίς ελεύθερο κείμενο από τον χρήστη, με banned-term scan σε κάθε output.",
  tabs: {
    placement: { label: "P1 · Θέση", hint: "πλανήτης σε ζώδιο σε οίκο" },
    aspect: { label: "P2 · Όψη", hint: "ζεύγος πλανητών" },
    synthesis: { label: "P3 · Σύνθεση", hint: "ολόκληρος χάρτης" },
    topic: { label: "P4 · Θέμα", hint: "κλειστή λίστα" },
  },
  planet: "Πλανήτης",
  planetA: "Πλανήτης Α",
  planetB: "Πλανήτης Β",
  sign: "Ζώδιο",
  house: "Οίκος",
  aspect: "Όψη",
  topic: "Θέμα",
  topicNote: "Κλειστό enum — ο χρήστης δεν πληκτρολογεί ποτέ.",
  birthDate: "Ημερομηνία γέννησης",
  birthTime: "Ώρα γέννησης",
  birthPlace: "Τόπος γέννησης",
  placePlaceholder: "π.χ. Θεσσαλονίκη",
  chartNote:
    "Ο χάρτης υπολογίζεται τοπικά (whole sign) και μόνο οι θέσεις στέλνονται στο μοντέλο.",
  generate: "Παραγωγή",
  generating: "Παράγεται…",
  error: "Σφάλμα",
  chartTitle: "Γενέθλιος χάρτης",
  analysis: "Ανάλυση χάρτη",
  interpretation: "Ερμηνεία",
  planets: "Πλανήτες",
  aspects: "Όψεις",
  noAspects: "Καμία όψη εντός ορίων.",
  asc: "Ωροσκόπος",
  mc: "Μεσουράνημα",
  flagged: "Χρειάζεται χειροκίνητο γράψιμο",
  flaggedBody: "Το κείμενο περιείχε όρους εκτός πλαισίου",
  flaggedTail: "και δεν εμφανίζεται.",
  footer: "Το περιεχόμενο προορίζεται αποκλειστικά για ψυχαγωγία και αυτογνωσία.",
  core: "Πυρήνας",
  arena: "Πεδίο",
  growth: "Εξέλιξη",
  keywords: "Λέξεις-κλειδιά",
  dynamic: "Δυναμική",
  showsUp: "Πώς εκδηλώνεται",
  work: "Δουλειά",
  strengths: "Δυνάμεις",
  tensions: "Εντάσεις",
  relationships: "Σχέσεις",
  workArea: "Εργασία",
  innerLife: "Εσωτερική ζωή",
  oneThing: "Ένα πράγμα",
  placementsUsed: "Θέσεις που χρησιμοποιήθηκαν",
  intensity: { low: "χαμηλή ένταση", medium: "μέτρια ένταση", high: "υψηλή ένταση" },
  topics: {
    relationships: "Σχέσεις",
    career: "Καριέρα",
    communication: "Επικοινωνία",
    emotional_needs: "Συναισθηματικές ανάγκες",
    strengths: "Δυνατά σημεία",
    blind_spots: "Τυφλά σημεία",
  },
};

const EN: typeof EL = {
  eyebrow: "Prompt Library v1.0",
  title: "Astrological Interpretation",
  intro:
    "Structured prompts for atoms, aspects, synthesis and topic deep-dives — no free text from the user, with a banned-term scan on every output.",
  tabs: {
    placement: { label: "P1 · Placement", hint: "planet in sign in house" },
    aspect: { label: "P2 · Aspect", hint: "planet pair" },
    synthesis: { label: "P3 · Synthesis", hint: "whole chart" },
    topic: { label: "P4 · Topic", hint: "fixed list" },
  },
  planet: "Planet",
  planetA: "Planet A",
  planetB: "Planet B",
  sign: "Sign",
  house: "House",
  aspect: "Aspect",
  topic: "Topic",
  topicNote: "Closed enum — the user never types.",
  birthDate: "Date of birth",
  birthTime: "Time of birth",
  birthPlace: "Place of birth",
  placePlaceholder: "e.g. Thessaloniki",
  chartNote: "The chart is computed locally (whole sign); only positions are sent to the model.",
  generate: "Generate",
  generating: "Generating…",
  error: "Error",
  chartTitle: "Birth chart",
  analysis: "Chart analysis",
  interpretation: "Interpretation",
  planets: "Planets",
  aspects: "Aspects",
  noAspects: "No aspects within orb.",
  asc: "Ascendant",
  mc: "Midheaven",
  flagged: "Needs manual writing",
  flaggedBody: "The text contained out-of-scope terms",
  flaggedTail: "and is not shown.",
  footer: "This content is for entertainment and self-reflection only.",
  core: "Core",
  arena: "Arena",
  growth: "Growth",
  keywords: "Keywords",
  dynamic: "Dynamic",
  showsUp: "How it shows up",
  work: "Work",
  strengths: "Strengths",
  tensions: "Tensions",
  relationships: "Relationships",
  workArea: "Work",
  innerLife: "Inner life",
  oneThing: "One thing",
  placementsUsed: "Placements used",
  intensity: { low: "low intensity", medium: "medium intensity", high: "high intensity" },
  topics: {
    relationships: "Relationships",
    career: "Career",
    communication: "Communication",
    emotional_needs: "Emotional needs",
    strengths: "Strengths",
    blind_spots: "Blind spots",
  },
};

export const dict = (lang: Lang) => (lang === "en" ? EN : EL);
export type Dict = typeof EL;
