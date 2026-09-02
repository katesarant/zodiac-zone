// Κοινές κλάσεις φόρμας — ίδιο look με το `field` της αρχικής σελίδας.
export const field =
  "w-full rounded-lg border border-input bg-secondary/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export const fieldError = `${field} border-destructive focus:border-destructive`;

export const btnPrimary =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-[0_10px_30px_-12px_var(--primary)] disabled:opacity-50 disabled:hover:shadow-sm";

export const btnOutline =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-secondary disabled:opacity-50";

export const btnDestructive =
  "inline-flex items-center justify-center rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
