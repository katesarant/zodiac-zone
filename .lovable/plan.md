# Header: logo, nav και μενού

## 1. Logo που δεν «σπάει»
- Στο `SiteHeader` το brand block γίνεται `inline-flex` με `gap: 2px`, `align-items: baseline` και `flex-shrink-0`, ώστε logo + κείμενο να μένουν πάντα σε μία γραμμή.
- Το `<Logo />` παίρνει σταθερό μέγεθος (δεν συρρικνώνεται) και μικρή οπτική διόρθωση ώστε να κάθεται σωστά στη baseline του κειμένου.
- Σε πολύ στενές οθόνες το κείμενο «My Zodiac Maps» παραμένει σε μία γραμμή (`whitespace-nowrap`) με ελαφρώς μικρότερο μέγεθος.
- Ίδια μεταχείριση στο `SiteFooter` για συνέπεια.

## 2. Nav στο header
- Ο διακόπτης γλώσσας (EL/EN) μπαίνει δεξιά με απόσταση 5px από την άκρη του header container.
- Τα υπόλοιπα nav στοιχεία στοιχίζονται στη σειρά πριν από αυτόν, με ενιαία αποστάσεις και ύψη κουμπιών.

## 3. Μενού κουμπί + νέες σελίδες
- Προσθήκη κουμπιού μενού (burger) που ανοίγει πλαϊνό/dropdown πάνελ.
- Σε desktop: φαίνονται τα βασικά links (Ζώδια, Οι χάρτες μου) + κουμπί μενού για τα υπόλοιπα.
- Σε mobile: όλα τα links μέσα στο μενού, μένουν ορατά μόνο το logo, ο διακόπτης γλώσσας και το burger.
- Περιεχόμενο μενού (ανά γλώσσα):
  - Αρχική
  - Ζώδια / Zodiac
  - Οδηγός: Τι ωροσκόπο έχω / What is my rising sign
  - Οδηγός: Πώς διαβάζω γενέθλιο χάρτη / How to read a birth chart
  - Οι χάρτες μου
  - Σχετικά, Επικοινωνία, Πολιτική απορρήτου, Όροι χρήσης

## Τεχνικές λεπτομέρειες
- Αλλαγές μόνο σε `src/components/site/SiteHeader.tsx`, `src/components/site/Logo.tsx` (αν χρειαστεί viewBox/alignment tweak) και `src/components/site/SiteFooter.tsx`.
- Το μενού υλοποιείται με υπάρχον shadcn `Sheet` (mobile) / απλό dropdown, χωρίς νέα dependency.
- Links από τα υπάρχοντα helpers `sitePagePath` και `guidePath`, χωρίς νέα routes.
- Καμία αλλαγή σε logic, SEO ή backend.
