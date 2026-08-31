# Ειδοποίηση στο Google Calendar σε κάθε publish

Κάθε φορά που ανεβαίνει νέα έκδοση του site στο myzodiacmaps.gr, δημιουργείται αυτόματα ένα event 15 λεπτών στο Google Calendar σου με ώρα το publish και σύνδεσμο στο site.

## Πώς θα δουλεύει

1. Κάθε build "σφραγίζεται" με μοναδικό αναγνωριστικό έκδοσης (ημερομηνία/ώρα build).
2. Ένας μικρός προγραμματισμένος έλεγχος διαβάζει το live site και συγκρίνει τη σφραγίδα με την τελευταία που έχει καταγραφεί.
3. Αν άλλαξε → καταγράφεται η νέα έκδοση και δημιουργείται event στο Google Calendar:
   - Τίτλος: `MyZodiacMaps — νέα δημοσίευση`
   - Διάρκεια: 15 λεπτά, από την ώρα που εντοπίστηκε
   - Περιγραφή: έκδοση build + σύνδεσμος https://myzodiacmaps.gr
4. Αν δεν άλλαξε τίποτα, δεν γίνεται καμία ενέργεια.

Συχνότητα ελέγχου: **κάθε ώρα**. Αυτό σημαίνει ότι το event μπορεί να εμφανιστεί έως και ~1 ώρα μετά το publish. Πιο συχνός έλεγχος (π.χ. κάθε 15 λεπτά) δίνει πιο άμεση ειδοποίηση αλλά κρατά τη βάση απασχολημένη 96 φορές τη μέρα ακόμα κι όταν δεν έχεις κάνει τίποτα, με αντίστοιχο κόστος. Ξεκινάμε με ωριαίο και το πυκνώνουμε αν το θέλεις.

## Τι χρειάζεται από εσένα

Σύνδεση του λογαριασμού Google Calendar μέσω του connector — θα σου εμφανιστεί κάρτα σύνδεσης κατά την υλοποίηση. Το event μπαίνει στο ημερολόγιο του λογαριασμού που θα συνδέσεις.

## Τεχνικές λεπτομέρειες

- `vite.config.ts`: `define` με `__BUILD_STAMP__` (ISO timestamp τη στιγμή του build).
- Νέο route `src/routes/api/public/build-info.ts` (GET) → επιστρέφει `{ buildStamp }`. Δημόσιο, μόνο ανάγνωση, χωρίς προσωπικά δεδομένα.
- Νέο route `src/routes/api/public/publish-watch.ts` (POST):
  - Διαβάζει `https://myzodiacmaps.gr/api/public/build-info`.
  - Συγκρίνει με την τελευταία εγγραφή στον πίνακα `publish_events`.
  - Νέα σφραγίδα → `INSERT` (unique στο `build_stamp`, idempotent) και κλήση Google Calendar.
  - Προστασία: header `x-publish-watch-secret` ελεγμένο με σταθερού χρόνου σύγκριση απέναντι σε secret (`PUBLISH_WATCH_SECRET`).
  - Χωρίς retries σε 4xx· log του status/body σε αποτυχία.
- Migration: `public.publish_events (id uuid pk, build_stamp text unique not null, detected_at timestamptz default now(), calendar_event_id text)` με `GRANT ALL ... TO service_role`, RLS enabled, χωρίς policies για anon/authenticated (server-only).
- Google Calendar: `POST {gateway}/google_calendar/calendar/v3/calendars/primary/events` με headers `Authorization: Bearer LOVABLE_API_KEY` και `X-Connection-Api-Key: GOOGLE_CALENDAR_API_KEY`, όλα server-side.
- Χρονοπρογραμματισμός: `cron.schedule('publish-watch-hourly', '0 * * * *', ...)` με `net.http_post` στο σταθερό production URL.
