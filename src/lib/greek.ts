/**
 * Greek text helpers.
 * Rule: capital (uppercase) Greek letters never carry tonos/accents.
 * Apply `stripTonos` to any string rendered with CSS `text-transform: uppercase`.
 */
export function stripTonos(s: string): string {
  if (!s) return s;
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
