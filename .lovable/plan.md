# Οδηγός μετάβασης του MyZodiacMaps σε C# Blazor

Θα δημιουργηθεί ένα αναλυτικό έγγραφο (PDF + Markdown) στα Files, για να το δώσετε σε προγραμματιστή .NET. Το τωρινό site δεν αλλάζει καθόλου.

## Περιεχόμενα του οδηγού

1. **Επισκόπηση**: τι κάνει το site, όλες οι σελίδες (EL/EN) και πώς αντιστοιχούν σε σελίδες Blazor (`@page`).
2. **Αρχιτεκτονική**: προτεινόμενη δομή με Blazor Web App (.NET 9), Server-side rendering για SEO, κάπου interactive components (φόρμα χάρτη, επικοινωνία).
3. **Αντιστοίχιση λειτουργιών**:
   - Υπολογισμός γενέθλιου χάρτη (engine) → C# υπηρεσία (π.χ. SwissEphemeris.NET)
   - Τροχός χάρτη (SVG) → Razor component
   - Ερμηνείες AI → HttpClient προς AI API, cache και φίλτρο απαγορευμένων λέξεων
   - Προβλέψεις ζωδίων και αυτόματη καθημερινή δημιουργία → Hosted Service / Hangfire
   - Βάση δεδομένων → PostgreSQL με Entity Framework Core (πίνακες και πεδία που υπάρχουν σήμερα)
   - Φόρμα επικοινωνίας, CAPTCHA, rate limiting, αποστολή email
   - Instagram stories (δημιουργία εικόνων με SkiaSharp) και αναλυτικά
   - Οι χάρτες μου (localStorage μέσω JS interop)
   - Δίγλωσσο (resx / IStringLocalizer), cookies, SEO (meta, sitemap, JSON-LD)
4. **Σχεδιασμός**: χρώματα, γραμματοσειρές, header/footer όπως σήμερα.
5. **Hosting και κόστος**: επιλογές (Azure App Service, VPS) και τι αλλάζει με το domain myzodiacmaps.gr.
6. **Βήματα και εκτίμηση χρόνου** ανά φάση.

## Τεχνικά

- Διαβάζω όλο τον κώδικα (routes, lib/astro, horoscope, stories, site, πίνακες βάσης) για ακριβή αντιστοίχιση.
- Έξοδος: `/mnt/documents/blazor-migration-guide.md` και `.pdf`, έλεγχος κάθε σελίδας του PDF πριν την παράδοση.
