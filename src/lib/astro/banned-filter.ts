import type { Lang } from "./types";

/** Greek: stems only — inflection escapes exact matching. */
export const BANNED_EL = [
  "θάνατ",
  "θανάτ",
  "θανατ",
  "πεθάν",
  "νεκρ",
  "κηδεί",
  "απώλεια ζωής",
  "μοιραί",
  "θνητ",
  "αυτοκτον",
  "χρεοκοπ",
  "πτώχευσ",
  "καταστροφ",
  "ρήμαξ",
  "οικονομική κατάρρευσ",
  "χρέη",
  "φτώχει",
  "ατύχημα",
  "τραγωδ",
  "δολοφον",
  "ασθένει",
  "αρρώστ",
  "καρκίν",
  "κατάθλιψ",
  "εγκυμοσύν",
];

export const BANNED_EN = [
  "death",
  "dying",
  "die",
  "deceased",
  "funeral",
  "fatal",
  "mortal",
  "suicide",
  "kill",
  "bankrupt",
  "ruin",
  "financial collapse",
  "poverty",
  "debt",
  "destitute",
  "accident",
  "tragedy",
  "illness",
  "disease",
  "cancer",
  "depression",
  "pregnancy",
];

function normalize(text: string) {
  return text.toLowerCase();
}

/** Collect every banned stem present in the text. */
export function findBannedTerms(text: string, lang: Lang): string[] {
  const list = lang === "el" ? BANNED_EL : BANNED_EN;
  const norm = normalize(text);
  return list.filter((term) => norm.includes(term));
}

/** Second line of defence (§8) — applies to atoms, synthesis and topics alike. */
export function isClean(text: string, lang: Lang): boolean {
  return findBannedTerms(text, lang).length === 0;
}

/** Scans every string value of an arbitrary AI result object. */
export function scanResult(value: unknown, lang: Lang): string[] {
  const hits = new Set<string>();
  const walk = (node: unknown) => {
    if (typeof node === "string") {
      findBannedTerms(node, lang).forEach((t) => hits.add(t));
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === "object") {
      Object.values(node as Record<string, unknown>).forEach(walk);
    }
  };
  walk(value);
  return [...hits];
}

export const RETRY_INSTRUCTION =
  "Your previous attempt used a forbidden theme. Rewrite using only the constructive dimension.";
