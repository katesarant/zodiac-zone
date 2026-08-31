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
  eyebrow: "MyZodiacMaps",
  title: "Ο γενέθλιος χάρτης σου",
  tagline: "Ο ουρανός τη στιγμή που γεννήθηκες",
  intro:
    "Συμπλήρωσε πού και πότε γεννήθηκες και δες πού βρίσκονταν ο Ήλιος, η Σελήνη και οι πλανήτες εκείνη τη στιγμή — μαζί με μια αναλυτική ερμηνεία στα ελληνικά.",

  tabs: {
    placement: { label: "Θέσεις", hint: "πλανήτης, ζώδιο και οίκος" },
    aspect: { label: "Όψεις", hint: "πώς συνομιλούν δύο πλανήτες" },
    synthesis: { label: "Ο χάρτης μου", hint: "συνολική εικόνα" },
  },

  planet: "Πλανήτης",
  planetA: "Πρώτος πλανήτης",
  planetB: "Δεύτερος πλανήτης",
  sign: "Ζώδιο",
  house: "Οίκος",
  aspect: "Όψη",

  birthDate: "Ημερομηνία γέννησης",
  birthTime: "Ώρα γέννησης",
  birthPlace: "Τόπος γέννησης",
  placePlaceholder: "π.χ. Θεσσαλονίκη",
  errBirthFields: "Συμπλήρωσε ημερομηνία, ώρα και τόπο γέννησης (τουλάχιστον 2 χαρακτήρες).",
  errInvalidInput: "Μη έγκυρα αστρολογικά δεδομένα. Διάλεξε τιμές από τις λίστες και δοκίμασε ξανά.",

  chartName: "Όνομα χάρτη",
  namePlaceholder: "π.χ. Μαρία",
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

  zodiac: {
    title: "Ζώδια",
    intro:
      "Καθημερινή, μηνιαία και ετήσια ανάγνωση του ουρανού για τα δώδεκα ζώδια — τι συμβαίνει ψηλά, όχι τι θα σου συμβεί.",
    pickSign: "Διάλεξε ζώδιο",
    today: "Σήμερα",
    month: "Ο μήνας",
    year: "Η χρονιά",
    archive: "Αρχείο",
    allSigns: "Όλα τα ζώδια",
    otherSigns: "Τα υπόλοιπα ζώδια",
    fallbackNotice: "Δεν υπάρχει ακόμη ανάγνωση για αυτή την ημερομηνία. Βλέπεις την πιο πρόσφατη:",
    empty: "Δεν υπάρχει διαθέσιμη ανάγνωση αυτή τη στιγμή.",
    updated: "Ενημερώθηκε",
    nav: "Προβλέψεις",
    periodLabel: "Είδος πρόβλεψης",
    allReadings: "Οι προβλέψεις της ημέρας",
    readMore: "Δες περισσότερα",
    loading: "Φόρτωση…",
  },

  library: {
    title: "Οι χάρτες μου",
    emptyTitle: "Καμία αποθήκευση ακόμη",
    emptyBody: "Οι αποθηκευμένοι χάρτες μένουν μόνο σε αυτή τη συσκευή, στον περιηγητή σου.",
    createFirst: "Φτιάξε τον πρώτο σου χάρτη",
    searchPlaceholder: "Αναζήτηση σε όνομα ή τόπο…",
    all: "Όλοι",
    favorites: "Αγαπημένοι",
    unfiled: "Χωρίς φάκελο",
    folders: "Φάκελοι",
    colName: "Όνομα",
    colBirthDate: "Ημ. γέννησης",
    colTime: "Ώρα",
    colPlace: "Τόπος",
    colSun: "Ήλιος",
    colActions: "Ενέργειες",
    sortBy: "Ταξινόμηση",
    sortDefault: "Αγαπημένα πρώτα",
    sortName: "Όνομα",
    sortBirth: "Ημ. γέννησης",
    sortSaved: "Πιο πρόσφατα",
    open: "Άνοιγμα",
    rename: "Μετονομασία",
    remove: "Διαγραφή",
    confirmDelete: "Να διαγραφεί αυτός ο χάρτης;",
    noResults: "Κανένας χάρτης δεν ταιριάζει στην αναζήτηση.",
    favorite: "Αγαπημένο",
    saveChart: "Αποθήκευση χάρτη",
    saveDialogTitle: "Αποθήκευση χάρτη",
    saveDialogBody: "Ο χάρτης αποθηκεύεται μόνο σε αυτή τη συσκευή.",
    label: "Όνομα",
    cancel: "Άκυρο",
    save: "Αποθήκευση",
    savedOk: "Αποθηκεύτηκε",
    pdfLabel: "Λήψη PDF",
    backupNote: "Οι χάρτες σου αποθηκεύονται μόνο σε αυτή τη συσκευή. Κατέβασε PDF για να κρατήσεις ένα αντίγραφο.",
    limitReached: "Έφτασες το όριο δημιουργιών για αυτή την ώρα. Δοκίμασε ξανά αργότερα.",
  },
  auth: {
    signInOrUp: "Σύνδεση / Εγγραφή",
    signIn: "Σύνδεση",
    signUp: "Εγγραφή",
    signOut: "Αποσύνδεση",
    myCharts: "Οι χάρτες μου",
    account: "Ο λογαριασμός μου",

    email: "Email",
    password: "Κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
    currentPassword: "Τρέχων κωδικός",
    newPassword: "Νέος κωδικός",
    displayName: "Όνομα εμφάνισης",
    language: "Γλώσσα",
    greek: "Ελληνικά",
    english: "Αγγλικά",

    signupTitle: "Δημιούργησε λογαριασμό",
    signupSubtitle: "Αποθήκευσε τους χάρτες σου και δες τους όποτε θέλεις.",
    loginTitle: "Καλώς ήρθες πίσω",
    loginSubtitle: "Συνδέσου για να δεις τους χάρτες σου.",
    forgotTitle: "Ξέχασες τον κωδικό σου;",
    forgotSubtitle: "Στείλε μας το email σου και θα λάβεις σύνδεσμο επαναφοράς.",
    resetTitle: "Νέος κωδικός",
    resetSubtitle: "Όρισε έναν νέο κωδικό για τον λογαριασμό σου.",
    accountTitle: "Ο λογαριασμός μου",
    accountSubtitle: "Διαχειρίσου τα στοιχεία και τις προτιμήσεις σου.",
    chartsTitle: "Οι χάρτες μου",
    chartsEmpty: "Δεν έχεις αποθηκεύσει ακόμη κάποιον χάρτη.",

    checkEmailTitle: "Έλεγξε το email σου",
    checkEmailBody: "Σου στείλαμε έναν σύνδεσμο επιβεβαίωσης. Άνοιξέ τον για να ενεργοποιήσεις τον λογαριασμό σου.",
    resetSentTitle: "Ο σύνδεσμος στάλθηκε",
    resetSentBody: "Αν υπάρχει λογαριασμός με αυτό το email, θα λάβεις σύνδεσμο επαναφοράς σε λίγο.",
    sendResetLink: "Στείλε σύνδεσμο",
    backToLogin: "Επιστροφή στη σύνδεση",
    forgotLink: "Ξέχασα τον κωδικό μου",
    noAccount: "Δεν έχεις λογαριασμό;",
    haveAccount: "Έχεις ήδη λογαριασμό;",

    saveChanges: "Αποθήκευση",
    saving: "Αποθήκευση…",
    saved: "Αποθηκεύτηκε",
    profileSection: "Στοιχεία προφίλ",
    passwordSection: "Αλλαγή κωδικού",
    changePassword: "Αλλαγή κωδικού",
    passwordChanged: "Ο κωδικός άλλαξε",
    working: "Περίμενε…",

    dangerSection: "Επικίνδυνη ζώνη",
    deleteAccount: "Διαγραφή λογαριασμού",
    deleteBody:
      "Η διαγραφή είναι οριστική. Σβήνονται ο λογαριασμός σου και όλοι οι αποθηκευμένοι χάρτες σου, χωρίς δυνατότητα επαναφοράς.",
    deleteConfirmLabel: "Γράψε DELETE για επιβεβαίωση",
    deleteConfirmWord: "DELETE",
    deleting: "Διαγραφή…",

    errors: {
      emailRequired: "Συμπλήρωσε το email σου.",
      emailInvalid: "Το email δεν φαίνεται σωστό.",
      passwordRequired: "Συμπλήρωσε κωδικό.",
      passwordShort: "Ο κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες.",
      passwordMismatch: "Οι κωδικοί δεν ταιριάζουν.",
      displayNameRequired: "Συμπλήρωσε ένα όνομα εμφάνισης.",
      invalidCredentials: "Λάθος email ή κωδικός.",
      emailNotConfirmed: "Επιβεβαίωσε πρώτα το email σου.",
      wrongCurrentPassword: "Ο τρέχων κωδικός δεν είναι σωστός.",
      typeDelete: "Γράψε ακριβώς DELETE για να συνεχίσεις.",
      generic: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      noResetSession: "Ο σύνδεσμος επαναφοράς έληξε ή δεν είναι έγκυρος. Ζήτησε νέο.",
    },
  },

  site: {
    contactEmail: "info@myzodiacmaps.gr",
    updated: "Τελευταία ενημέρωση: 31 Αυγούστου 2026",
    rights: "Όλα τα δικαιώματα διατηρούνται.",
    disclaimer:
      "Το περιεχόμενο του MyZodiacMaps είναι ψυχαγωγικού χαρακτήρα και δεν αποτελεί ιατρική, ψυχολογική, νομική ή οικονομική συμβουλή.",
    nav: {
      home: "Αρχική",
      forecasts: "Προβλέψεις",
      about: "Σχετικά",
      contact: "Επικοινωνία",
      privacy: "Πολιτική απορρήτου",
      terms: "Όροι χρήσης",
    },
    cookie: {
      text: "Χρησιμοποιούμε cookies για τη λειτουργία του site και, εφόσον συμφωνήσεις, για μέτρηση επισκεψιμότητας και διαφημίσεις.",
      accept: "Αποδοχή",
      reject: "Μόνο τα απαραίτητα",
      more: "Περισσότερα",
    },
    contactIntro:
      "Για απορίες, διορθώσεις ή συνεργασίες, στείλε μας email. Απαντάμε συνήθως μέσα σε λίγες μέρες.",
    contactCta: "Στείλε email",
  },

  legal: {
    privacy: {
      title: "Πολιτική απορρήτου",
      description:
        "Πώς διαχειρίζεται το MyZodiacMaps τα δεδομένα σου: cookies, γενέθλια στοιχεία, διαφημιστικοί συνεργάτες και τα δικαιώματά σου.",
      sections: [
        {
          h: "Ποιοι είμαστε",
          p: [
            "Το MyZodiacMaps (myzodiacmaps.gr) προσφέρει υπολογισμό γενέθλιου χάρτη και ημερήσιες, μηνιαίες και ετήσιες αναγνώσεις για τα δώδεκα ζώδια.",
          ],
        },
        {
          h: "Τι δεδομένα συλλέγουμε",
          p: [
            "Δεν δημιουργείς λογαριασμό και δεν αποθηκεύουμε προσωπικά στοιχεία σε βάση δεδομένων. Τα γενέθλια στοιχεία που συμπληρώνεις (ημερομηνία, ώρα, τόπος, όνομα χάρτη) αποθηκεύονται μόνο τοπικά στον browser σου και μπορείς να τα διαγράψεις όποτε θέλεις.",
            "Για τον υπολογισμό και την ερμηνεία, τα αστρολογικά δεδομένα του χάρτη (θέσεις πλανητών, όψεις) αποστέλλονται στον πάροχο τεχνητής νοημοσύνης που παράγει το κείμενο. Δεν αποστέλλεται όνομα ή email.",
            "Για τεχνικούς λόγους ασφάλειας κρατάμε προσωρινά τη διεύθυνση IP ώστε να περιορίζουμε την κατάχρηση του εργαλείου.",
          ],
        },
        {
          h: "Cookies και τεχνολογίες παρακολούθησης",
          p: [
            "Τα απαραίτητα cookies κρατούν επιλογές όπως η γλώσσα και οι αποθηκευμένοι χάρτες σου. Λειτουργούν πάντα.",
            "Τα προαιρετικά cookies αφορούν στατιστικά επισκεψιμότητας και διαφημίσεις. Ενεργοποιούνται μόνο αν δώσεις τη συγκατάθεσή σου στο σχετικό banner και μπορείς να την ανακαλέσεις όποτε θέλεις καθαρίζοντας τα δεδομένα του site.",
          ],
        },
        {
          h: "Διαφημίσεις",
          p: [
            "Ενδέχεται να προβάλλουμε διαφημίσεις μέσω τρίτων δικτύων, όπως το Google AdSense. Οι πάροχοι αυτοί μπορεί να χρησιμοποιούν cookies για την προβολή σχετικών διαφημίσεων με βάση προηγούμενες επισκέψεις σου σε αυτό ή σε άλλα sites.",
            "Μπορείς να ρυθμίσεις τις προτιμήσεις σου για τις διαφημίσεις της Google στη σελίδα Ρυθμίσεων Διαφημίσεων της Google.",
          ],
        },
        {
          h: "Τα δικαιώματά σου",
          p: [
            "Επειδή δεν τηρούμε αρχείο χρηστών, τα δεδομένα σου βρίσκονται στη συσκευή σου: μπορείς να τα διαγράψεις άμεσα από τη σελίδα «Οι χάρτες μου» ή καθαρίζοντας τα δεδομένα του browser.",
            "Βάσει GDPR έχεις δικαίωμα πρόσβασης, διόρθωσης, διαγραφής και εναντίωσης. Για οποιοδήποτε αίτημα επικοινώνησε μαζί μας.",
          ],
        },
      ],
    },
    terms: {
      title: "Όροι χρήσης",
      description:
        "Οι όροι χρήσης του MyZodiacMaps: χαρακτήρας περιεχομένου, πνευματικά δικαιώματα και όρια ευθύνης.",
      sections: [
        {
          h: "Αποδοχή των όρων",
          p: [
            "Χρησιμοποιώντας το MyZodiacMaps αποδέχεσαι τους παρακάτω όρους. Αν διαφωνείς, παρακαλούμε μην χρησιμοποιείς την υπηρεσία.",
          ],
        },
        {
          h: "Χαρακτήρας του περιεχομένου",
          p: [
            "Οι χάρτες, οι ερμηνείες και οι προβλέψεις έχουν ψυχαγωγικό και αυτογνωσιακό χαρακτήρα. Δεν αποτελούν ιατρική, ψυχολογική, νομική ή οικονομική συμβουλή και δεν πρέπει να χρησιμοποιούνται ως βάση για σοβαρές αποφάσεις.",
            "Μέρος του κειμένου παράγεται αυτόματα με τεχνητή νοημοσύνη και μπορεί να περιέχει ανακρίβειες.",
          ],
        },
        {
          h: "Χρήση της υπηρεσίας",
          p: [
            "Η υπηρεσία προσφέρεται δωρεάν και «ως έχει». Απαγορεύεται η αυτοματοποιημένη μαζική άντληση περιεχομένου, η υπερφόρτωση των υποδομών και κάθε χρήση που παραβιάζει τον νόμο.",
          ],
        },
        {
          h: "Πνευματικά δικαιώματα",
          p: [
            "Το περιεχόμενο, ο σχεδιασμός και ο κώδικας του site ανήκουν στο MyZodiacMaps. Μπορείς να μοιραστείς αποσπάσματα με αναφορά στην πηγή.",
          ],
        },
        {
          h: "Περιορισμός ευθύνης",
          p: [
            "Δεν φέρουμε ευθύνη για ζημίες που μπορεί να προκύψουν από τη χρήση ή την αδυναμία χρήσης του site, ούτε για διακοπές λειτουργίας.",
          ],
        },
      ],
    },
    about: {
      title: "Σχετικά με εμάς",
      description:
        "Τι είναι το MyZodiacMaps, πώς υπολογίζονται οι χάρτες και πώς γράφονται οι αναγνώσεις των ζωδίων.",
      sections: [
        {
          h: "Η ιδέα",
          p: [
            "Το MyZodiacMaps ξεκίνησε από μια απλή σκέψη: οι περισσότερες αστρολογικές σελίδες λένε στους ανθρώπους τι θα τους συμβεί. Εμείς προτιμάμε να περιγράφουμε τι κάνει ο ουρανός και να αφήνουμε την ερμηνεία στον αναγνώστη.",
          ],
        },
        {
          h: "Πώς υπολογίζουμε",
          p: [
            "Ο γενέθλιος χάρτης υπολογίζεται με αστρονομικούς αλγορίθμους από την ημερομηνία, την ώρα και τις συντεταγμένες γέννησης: θέσεις πλανητών, οίκοι, ωροσκόπος και όψεις.",
            "Οι ημερήσιες, μηνιαίες και ετήσιες αναγνώσεις προκύπτουν από τις πραγματικές όψεις των πλανητών για την αντίστοιχη περίοδο και όχι από τυχαία κείμενα.",
          ],
        },
        {
          h: "Ο ρόλος της τεχνητής νοημοσύνης",
          p: [
            "Τα αστρονομικά δεδομένα υπολογίζονται από εμάς. Η τεχνητή νοημοσύνη χρησιμοποιείται μόνο για να μετατρέψει αυτά τα δεδομένα σε καθημερινό, κατανοητό κείμενο, με αυστηρούς κανόνες: καμία πρόβλεψη γεγονότων, καμία συμβουλή υγείας ή χρημάτων.",
          ],
        },
        {
          h: "Γλώσσες",
          p: ["Όλο το περιεχόμενο είναι διαθέσιμο στα ελληνικά και στα αγγλικά."],
        },
      ],
    },
    contact: {
      title: "Επικοινωνία",
      description: "Επικοινώνησε με την ομάδα του MyZodiacMaps για απορίες, διορθώσεις ή συνεργασίες.",
      sections: [
        {
          h: "Πότε να μας γράψεις",
          p: [
            "Αν εντόπισες λάθος σε έναν χάρτη ή σε μια ανάγνωση, αν θέλεις να προτείνεις κάτι, ή αν σε ενδιαφέρει συνεργασία και διαφημιστική προβολή.",
          ],
        },
        {
          h: "Προσωπικά δεδομένα",
          p: [
            "Δεν υπάρχει φόρμα που να αποθηκεύει δεδομένα: το email σου πηγαίνει απευθείας σε εμάς και χρησιμοποιείται μόνο για να σου απαντήσουμε.",
          ],
        },
      ],
    },
  },
};

const EN: typeof EL = {
  eyebrow: "MyZodiacMaps",
  tagline: "Your birth chart, mapped",
  title: "Your birth chart",
  intro:
    "Tell us where and when you were born, and see exactly where the Sun, Moon and planets stood at that moment — with a full reading in English.",

  tabs: {
    placement: { label: "Placements", hint: "planet, sign and house" },
    aspect: { label: "Aspects", hint: "how two planets talk to each other" },
    synthesis: { label: "My chart", hint: "the whole picture" },
  },

  planet: "Planet",
  planetA: "First planet",
  planetB: "Second planet",
  sign: "Sign",
  house: "House",
  aspect: "Aspect",

  birthDate: "Date of birth",
  birthTime: "Time of birth",
  birthPlace: "Place of birth",
  placePlaceholder: "e.g. Thessaloniki",
  errBirthFields: "Please fill in birth date, time and place (at least 2 characters).",
  errInvalidInput: "Invalid astrology data. Please pick values from the lists and try again.",

  chartName: "Chart name",
  namePlaceholder: "e.g. Maria",
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

  zodiac: {
    title: "Zodiac",
    intro:
      "Daily, monthly and yearly readings of the sky for the twelve signs — what the sky is doing, not what will happen to you.",
    pickSign: "Choose a sign",
    today: "Today",
    month: "This month",
    year: "This year",
    archive: "Archive",
    allSigns: "All signs",
    otherSigns: "The other signs",
    fallbackNotice: "There is no reading for that date yet. You are seeing the most recent one:",
    empty: "No reading is available right now.",
    updated: "Updated",
    nav: "Forecasts",
    periodLabel: "Forecast type",
    allReadings: "Today's readings",
    readMore: "Read more",
    loading: "Loading…",
  },

  library: {
    title: "My charts",
    emptyTitle: "Nothing saved yet",
    emptyBody: "Saved charts live only on this device, inside your browser.",
    createFirst: "Create your first chart",
    searchPlaceholder: "Search by name or place…",
    all: "All",
    favorites: "Favourites",
    unfiled: "Unfiled",
    folders: "Folders",
    colName: "Name",
    colBirthDate: "Birth date",
    colTime: "Time",
    colPlace: "Place",
    colSun: "Sun",
    colActions: "Actions",
    sortBy: "Sort",
    sortDefault: "Favourites first",
    sortName: "Name",
    sortBirth: "Birth date",
    sortSaved: "Newest",
    open: "Open",
    rename: "Rename",
    remove: "Delete",
    confirmDelete: "Delete this chart?",
    noResults: "No chart matches your search.",
    favorite: "Favourite",
    saveChart: "Save chart",
    saveDialogTitle: "Save chart",
    saveDialogBody: "This chart is stored only on this device.",
    label: "Name",
    cancel: "Cancel",
    save: "Save",
    savedOk: "Saved",
    pdfLabel: "Download PDF",
    backupNote: "Your charts are stored only on this device. Download a PDF to keep a copy.",
    limitReached: "You have reached the generation limit for this hour. Please try again later.",
  },
  auth: {
    signInOrUp: "Sign in / Sign up",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    myCharts: "My charts",
    account: "My account",

    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    currentPassword: "Current password",
    newPassword: "New password",
    displayName: "Display name",
    language: "Language",
    greek: "Greek",
    english: "English",

    signupTitle: "Create your account",
    signupSubtitle: "Save your charts and come back to them anytime.",
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to see your charts.",
    forgotTitle: "Forgot your password?",
    forgotSubtitle: "Give us your email and we'll send a reset link.",
    resetTitle: "New password",
    resetSubtitle: "Choose a new password for your account.",
    accountTitle: "My account",
    accountSubtitle: "Manage your details and preferences.",
    chartsTitle: "My charts",
    chartsEmpty: "You haven't saved a chart yet.",

    checkEmailTitle: "Check your email",
    checkEmailBody: "We sent you a confirmation link. Open it to activate your account.",
    resetSentTitle: "Link sent",
    resetSentBody: "If an account exists for that email, a reset link is on its way.",
    sendResetLink: "Send reset link",
    backToLogin: "Back to sign in",
    forgotLink: "I forgot my password",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",

    saveChanges: "Save changes",
    saving: "Saving…",
    saved: "Saved",
    profileSection: "Profile details",
    passwordSection: "Change password",
    changePassword: "Change password",
    passwordChanged: "Password updated",
    working: "Working…",

    dangerSection: "Danger zone",
    deleteAccount: "Delete account",
    deleteBody:
      "Deletion is permanent. Your account and every chart you saved are erased, with no way to restore them.",
    deleteConfirmLabel: "Type DELETE to confirm",
    deleteConfirmWord: "DELETE",
    deleting: "Deleting…",

    errors: {
      emailRequired: "Enter your email.",
      emailInvalid: "That email doesn't look right.",
      passwordRequired: "Enter a password.",
      passwordShort: "Use at least 8 characters.",
      passwordMismatch: "The passwords don't match.",
      displayNameRequired: "Enter a display name.",
      invalidCredentials: "Wrong email or password.",
      emailNotConfirmed: "Confirm your email address first.",
      wrongCurrentPassword: "That current password isn't right.",
      typeDelete: "Type DELETE exactly to continue.",
      generic: "Something went wrong. Please try again.",
      noResetSession: "This reset link expired or isn't valid. Request a new one.",
    },
  },
};

export const dict = (lang: Lang) => (lang === "en" ? EN : EL);
export type Dict = typeof EL;
