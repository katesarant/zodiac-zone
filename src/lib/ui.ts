// Κοινές κλάσεις φόρμας — ίδιο look με το `field` της αρχικής σελίδας.
export const field =
  "w-full rounded-lg border border-input bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export const fieldError = `${field} border-destructive focus:border-destructive`;

export const btnPrimary =
  "inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";

export const btnOutline =
  "inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50";

export const btnDestructive =
  "inline-flex items-center justify-center rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
