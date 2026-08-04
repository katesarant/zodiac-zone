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
// Αντικαθιστά τα const EL και const EN στο src/lib/astro/i18n.ts
// ΜΗΝ αγγίξεις τα SIGN_EN / PLANET_EN / ASPECT_EN — είναι συμβόλαιο με το μοντέλο.

const EL = {
  eyebrow: "Zodiac Zone",
  title: "Ο γενέθλιος χάρτης σου",
  intro:
    "Συμπλήρωσε πού και πότε γεννήθηκες και δες πού βρίσκονταν ο Ήλιος, η Σελήνη και οι πλανήτες εκείνη τη στιγμή — μαζί με μια αναλυτική ερμηνεία στα ελληνικά.",

  tabs: {
    placement: { label: "Θέσεις", hint: "πλανήτης, ζώδιο και οίκος" },
    aspect: { label: "Όψεις", hint: "πώς συνομιλούν δύο πλανήτες" },
    synthesis: { label: "Ο χάρτης μου", hint: "συνολική εικόνα" },
    topic: { label: "Εμβάθυνση", hint: "διάλεξε θέμα" },
  },

  planet: "Πλανήτης",
  planetA: "Πρώτος πλανήτης",
  planetB: "Δεύτερος πλανήτης",
  sign: "Ζώδιο",
  house: "Οίκος",
  aspect: "Όψη",
  topic: "Θέμα",
  topicNote: "Διάλεξε ένα από τα θέματα για πιο αναλυτική ματιά.",

  birthDate: "Ημερομηνία γέννησης",
  birthTime: "Ώρα γέννησης",
  birthPlace: "Τόπος γέννησης",
  placePlaceholder: "π.χ. Θεσσαλονίκη",
  chartNote: "Η ακριβής ώρα έχει σημασία: λίγα λεπτά διαφορά μπορούν να αλλάξουν τον Ωροσκόπο και τους οίκους σου.",

  generate: "Δες τον χάρτη σου",
  generating: "Υπολογίζεται…",
  error: "Κάτι πήγε στραβά",

  chartTitle: "Ο χάρτης σου",
  analysis: "Τι δείχνει ο χάρτης",
  interpretation: "Η ερμηνεία σου",
  planets: "Πλανήτες",
  aspects: "Όψεις",
  noAspects: "Δεν σχηματίζονται σημαντικές όψεις σε αυτόν τον χάρτη.",
  asc: "Ωροσκόπος",
  mc: "Μεσουράνημα",

  flagged: "Δεν μπορούμε να δείξουμε αυτό το κομμάτι",
  flaggedBody: "Το κείμενο ξέφυγε από τα θέματα που καλύπτουμε",
  flaggedTail: "και δεν εμφανίζεται.",

  footer:
    "Το περιεχόμενο προορίζεται για ψυχαγωγία και αυτογνωσία. Δεν αντικαθιστά ιατρική, ψυχολογική, νομική ή οικονομική συμβουλή.",

  core: "Ο πυρήνας",
  arena: "Πού φαίνεται",
  growth: "Το στοίχημα",
  keywords: "Με δυο λόγια",
  dynamic: "Η δυναμική",
  showsUp: "Πώς εκδηλώνεται",
  work: "Τι ζητάει από σένα",

  signatureTitle: "Η υπογραφή σου",
  strengths: "Τι σε ευνοεί",
  tensions: "Πού δυσκολεύεσαι",
  relationships: "Στις σχέσεις",
  workArea: "Στη δουλειά",
  innerLife: "Μέσα σου",
  oneThing: "Αν κρατήσεις ένα πράγμα",
  placementsUsed: "Βασίστηκε σε",

  intensity: { low: "ήπια", medium: "αισθητή", high: "έντονη" },

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
  eyebrow: "Zodiac Zone",
  title: "Your birth chart",
  intro:
    "Tell us where and when you were born, and see exactly where the Sun, Moon and planets stood at that moment — with a full reading in English.",

  tabs: {
    placement: { label: "Placements", hint: "planet, sign and house" },
    aspect: { label: "Aspects", hint: "how two planets talk to each other" },
    synthesis: { label: "My chart", hint: "the whole picture" },
    topic: { label: "Go deeper", hint: "pick a theme" },
  },

  planet: "Planet",
  planetA: "First planet",
  planetB: "Second planet",
  sign: "Sign",
  house: "House",
  aspect: "Aspect",
  topic: "Theme",
  topicNote: "Choose a theme for a closer look.",

  birthDate: "Date of birth",
  birthTime: "Time of birth",
  birthPlace: "Place of birth",
  placePlaceholder: "e.g. Thessaloniki",
  chartNote: "The exact time matters: a few minutes can change your Ascendant and your houses.",

  generate: "Reveal my chart",
  generating: "Calculating…",
  error: "Something went wrong",

  chartTitle: "Your chart",
  analysis: "What the chart shows",
  interpretation: "Your reading",
  planets: "Planets",
  aspects: "Aspects",
  noAspects: "No significant aspects form in this chart.",
  asc: "Ascendant",
  mc: "Midheaven",

  flagged: "We can't show this section",
  flaggedBody: "The text drifted outside the themes we cover",
  flaggedTail: "so it isn't shown.",

  footer:
    "This content is for entertainment and self-reflection. It is not medical, psychological, legal or financial advice.",

  core: "The core",
  arena: "Where it shows",
  growth: "The challenge",
  keywords: "In short",
  dynamic: "The dynamic",
  showsUp: "How it shows up",
  work: "What it asks of you",

  signatureTitle: "Your signature",
  strengths: "What works for you",
  tensions: "Where it gets hard",
  relationships: "In relationships",
  workArea: "At work",
  innerLife: "Within you",
  oneThing: "If you take one thing away",
  placementsUsed: "Based on",

  intensity: { low: "gentle", medium: "noticeable", high: "intense" },

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
