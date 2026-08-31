# SEO status and AdSense readiness

## Πού είμαστε τώρα (επιβεβαιωμένο από τον κώδικα)

Το τεχνικό SEO είναι σε καλή κατάσταση:

- Μοναδικοί τίτλοι/descriptions ανά σελίδα (`src/lib/horoscope/head.ts`, `el.index.tsx`, `en.index.tsx`, `my-charts.tsx`)
- canonical + hreflang el/en/x-default σε όλες τις σελίδες ζωδίων
- Article JSON-LD στις σελίδες ανάγνωσης
- Δυναμικό `sitemap.xml` με όλους τους συνδυασμούς + build-time έλεγχος διπλότυπων
- `robots.txt` με sitemap και άδεια σε Googlebot/Bingbot/crawlers κοινωνικών
- og:image / twitter:image (στο root)
- SSR σε όλες τις σελίδες, άρα ο Google βλέπει το κείμενο

## Τι λείπει για έγκριση AdSense

Το AdSense κόβει αιτήσεις κυρίως για πολιτικές σελίδες και «λεπτό» περιεχόμενο. Λείπουν:

1. **Privacy Policy** — υποχρεωτικό, με αναφορά σε cookies και διαφημιστικούς συνεργάτες
2. **Terms of Use** και **Disclaimer** — απαραίτητο για αστρολογικό περιεχόμενο («ψυχαγωγικού χαρακτήρα»)
3. **About** και **Contact** — το AdSense θέλει ταυτότητα εκδότη
4. **Footer** με συνδέσμους προς αυτές τις σελίδες σε κάθε σελίδα
5. **Cookie consent banner** (GDPR/CMP) — υποχρεωτικό για ελληνικό/ευρωπαϊκό κοινό με διαφημίσεις
6. **`public/ads.txt`** — μπαίνει μετά την έγκριση, με το publisher ID
7. **Περιεχόμενο βάθους**: αυτή τη στιγμή υπάρχει μόνο 1 ημέρα αρχείου· χρειάζονται σελίδες με σταθερό, μη αυτόματο περιεχόμενο (π.χ. σελίδα ανά ζώδιο με χαρακτηριστικά, οδηγός ανάγνωσης χάρτη)

## Τι θα φτιάξω

**Νέες σελίδες (el + en, με δικό τους head/canonical/hreflang):**

- `/el/politiki-aporritou` · `/en/privacy`
- `/el/oroi-chrisis` · `/en/terms`
- `/el/schetika` · `/en/about`
- `/el/epikoinonia` · `/en/contact` (φόρμα mailto, χωρίς αποθήκευση δεδομένων)

**Κοινό footer** (`src/components/site/SiteFooter.tsx`) στο `__root.tsx`, με τους παραπάνω συνδέσμους, disclaimer μιας γραμμής και εναλλαγή γλώσσας. Όλα τα λεκτικά μέσω `i18n.ts` σε el+en.

**Cookie consent** — ελαφρύ banner, επιλογή αποδοχής/απόρριψης, αποθήκευση σε localStorage, χωρίς εξωτερική βιβλιοθήκη· η κατάσταση εκτίθεται ώστε αργότερα να ενεργοποιεί τα ad scripts.

**SEO συμπληρώματα:**
- WebSite + Organization JSON-LD στη ρίζα, BreadcrumbList στις σελίδες ζωδίων
- Οι νέες σελίδες μπαίνουν στο `sitemap.xml` και στο `scripts/check-sitemap.ts`
- `og:image` και ανά-σελίδα εκεί που έχει νόημα

**Δεν θα κάνω τώρα:** τοποθέτηση διαφημιστικών slots ή `ads.txt` — αυτά μπαίνουν αφού πάρεις publisher ID.

## Τεχνικές λεπτομέρειες

- Νέα route files στο `src/routes/` με το υπάρχον flat naming (`el.privacy.tsx` κ.λπ.), head μέσω helper στο `src/lib/horoscope/head.ts` ή νέο `src/lib/site/head.ts`
- Κανένα νέο dependency, καμία αλλαγή στα theme tokens· χρήση `panel`, `font-display`, `font-body`
- Καμία αλλαγή στο backend
