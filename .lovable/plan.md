# Logo πριν το MyZodiacMaps

## Στόχος
Προσθήκη ενός μικρού, θεματικού logo αριστερά από το κείμενο "My Zodiac Maps" στο `SiteHeader`, χωρίς να αλλάξει η θέση του brand block.

## Τι θα φτιαχτεί

1. **Νέο component `src/components/site/Logo.tsx`**
   - Inline SVG, απλό και ευανάγνωστο σε μικρό μέγεθος.
   - Θεματικό σχήμα: ένας μικρός αστέρας με τροχιά, σε ύφος που ταιριάζει στο celestial/brass theme.
   - Χρήση `currentColor` για fill/stroke ώστε να κληρονομεί το χρώμα από το κείμενο (`text-foreground`) και να προσαρμόζεται στο theme.
   - Μέγεθος ~24×24px με `aria-hidden="true"` (το κείμενο του brand καλύπτει την προσιτότητα).

2. **Ενημέρωση `src/components/site/SiteHeader.tsx`**
   - Αντικατάσταση του μονού κειμένου με ομάδα `flex items-center gap-2` που περιέχει `<Logo />` και το κείμενο "My Zodiac Maps".
   - Διατήρηση των υπαρχόντων στυλ (font-display, tracking-tight, text-foreground).
   - Προσθήκη `aria-label` στο Link για screen readers.

3. **Έλεγχοι**
   - Το header ήδη κρύβεται στο print CSS, άρα δεν χρειάζεται επιπλέον print styling.
   - Δεν αλλάζουν theme tokens, routes, ή λεκτικά i18n.
   - Typecheck και preview για σωστή ευθυγράμμιση.

## Τεχνικές λεπτομέρειες
- Δεν χρησιμοποιούμε εξωτερική εικόνα — inline SVG για απόδοση και theme adaptability.
- Δεν προσθέτουμε νέα dependencies.
- Το logo δεν θα είναι link από μόνο του· παραμένει μέσα στο υπάρχον `Link to="/"`.
