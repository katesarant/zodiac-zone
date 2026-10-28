import type { Lang } from "@/lib/astro/types";
import { SITE_URL } from "@/lib/horoscope/signs";

export type GuideKey = "rising" | "readChart" | "moon" | "calculator";

export interface GuideSection {
  h: string;
  p: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideContent {
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  ctaHref: string;
  faqTitle: string;
}

export const GUIDE_SLUGS: Record<GuideKey, Record<Lang, string>> = {
  rising: { el: "ti-oroskopo-eho", en: "what-is-my-rising-sign" },
  readChart: { el: "pws-diavazw-genethlio-charti", en: "how-to-read-birth-chart" },
  moon: { el: "se-ti-zodio-einai-i-selini-mou", en: "what-is-my-moon-sign" },
  calculator: { el: "genethlios-chartis-dorean", en: "birth-chart-calculator" },
};

export function guidePath(key: GuideKey, lang: Lang): string {
  return `/${lang}/${GUIDE_SLUGS[key][lang]}`;
}

export function guideUrls(): string[] {
  const out: string[] = [];
  for (const key of Object.keys(GUIDE_SLUGS) as GuideKey[]) {
    for (const lang of ["el", "en"] as const) out.push(`${SITE_URL}${guidePath(key, lang)}`);
  }
  return out;
}

const GUIDES: Record<Lang, Record<GuideKey, GuideContent>> = {
  el: {
    rising: {
      title: "Τι ωροσκόπο έχω;",
      metaTitle: "Τι ωροσκόπο έχω; Βρες τον ωροσκόπο σου δωρεάν",
      description:
        "Ο ωροσκόπος σου εξαρτάται από την ακριβή ώρα και τον τόπο γέννησης. Δες τι είναι, πώς τον βρίσκεις δωρεάν και τι δείχνει για σένα.",
      intro:
        "Ο ωροσκόπος (ή ζώδιο ανατολής) είναι το ζώδιο που ανέτειλε στον ορίζοντα τη στιγμή που γεννήθηκες. Δεν είναι το ίδιο με το ζώδιο του Ήλιου — αλλάζει περίπου κάθε δύο ώρες, γι' αυτό χρειάζεται ακριβής ώρα γέννησης.",
      sections: [
        {
          h: "Ωροσκόπος και ζώδιο: ποια είναι η διαφορά",
          p: [
            "Το ζώδιο που ξέρουν όλοι είναι το ηλιακό: δείχνει πού βρισκόταν ο Ήλιος την ημέρα που γεννήθηκες και αλλάζει μία φορά τον μήνα.",
            "Ο ωροσκόπος αλλάζει πολύ πιο γρήγορα, περίπου κάθε δύο ώρες. Είναι η «πόρτα» του χάρτη σου: περιγράφει το πώς σε βλέπουν οι άλλοι, το πρώτο σου ένστικτο σε νέες καταστάσεις και το ύφος με το οποίο ξεκινάς πράγματα.",
            "Δύο άνθρωποι με ίδιο ζώδιο αλλά διαφορετικό ωροσκόπο μοιάζουν συχνά ελάχιστα μεταξύ τους — και αυτός είναι ο βασικός λόγος που ο γενέθλιος χάρτης λέει πολύ περισσότερα από το ημερήσιο ζώδιο.",
          ],
        },
        {
          h: "Τι χρειάζεσαι για να τον βρεις",
          p: [
            "Ακριβή ημερομηνία γέννησης, ώρα γέννησης (όσο πιο κοντά στο λεπτό γίνεται) και πόλη γέννησης. Η ώρα είναι το κρίσιμο στοιχείο.",
            "Αν δεν ξέρεις την ώρα σου, θα τη βρεις συνήθως στο βιβλιάριο υγείας, στη ληξιαρχική πράξη γέννησης ή στο μαιευτήριο όπου γεννήθηκες.",
            "Μια απόκλιση 10–15 λεπτών σπάνια αλλάζει τον ωροσκόπο, αλλά αν γεννήθηκες κοντά στην αλλαγή ζωδίου μπορεί να μετακινήσει και ολόκληρα σπίτια του χάρτη.",
          ],
        },
        {
          h: "Πώς τον υπολογίζεις δωρεάν στο MyZodiacMaps",
          p: [
            "Συμπλήρωσε ημερομηνία, ώρα και τόπο γέννησης στη φόρμα του χάρτη. Ο υπολογισμός γίνεται με πραγματικές εφημερίδες θέσεων και λαμβάνει υπόψη τη ζώνη ώρας και τη θερινή ώρα της χρονιάς σου.",
            "Θα δεις αμέσως τον ωροσκόπο σου, το ζώδιο της Σελήνης και τις θέσεις όλων των πλανητών στα δώδεκα σπίτια, μαζί με ερμηνεία σε απλά ελληνικά.",
            "Δεν χρειάζεται λογαριασμός και τα στοιχεία σου μένουν στη συσκευή σου.",
          ],
        },
        {
          h: "Τι δείχνει ο ωροσκόπος σου",
          p: [
            "Την πρώτη εντύπωση που δίνεις, την εμφάνιση και τη «στάση σώματος» του χαρακτήρα σου.",
            "Τον κυβερνήτη του χάρτη σου: ο πλανήτης που κυβερνά τον ωροσκόπο γίνεται το πιο σημαντικό σημείο ολόκληρου του χάρτη.",
            "Τη δομή των σπιτιών — δηλαδή σε ποιους τομείς της ζωής σου (καριέρα, σχέσεις, οικογένεια, χρήματα) πέφτει κάθε πλανήτης.",
          ],
        },
      ],
      faq: [
        {
          q: "Μπορώ να βρω τον ωροσκόπο μου χωρίς ώρα γέννησης;",
          a: "Όχι με ακρίβεια. Χωρίς ώρα μπορείς να δεις τον Ήλιο και συνήθως τη Σελήνη σου, αλλά ο ωροσκόπος και τα σπίτια απαιτούν την ώρα γέννησης.",
        },
        {
          q: "Ο ωροσκόπος είναι πιο σημαντικός από το ζώδιό μου;",
          a: "Δεν είναι πιο σημαντικός, είναι συμπληρωματικός. Ο Ήλιος δείχνει τον πυρήνα σου, ο ωροσκόπος τον τρόπο που τον εκφράζεις προς τα έξω.",
        },
        {
          q: "Αλλάζει ο ωροσκόπος με τα χρόνια;",
          a: "Όχι. Υπολογίζεται μία φορά από τη στιγμή γέννησης και μένει σταθερός για όλη σου τη ζωή.",
        },
        {
          q: "Είναι δωρεάν ο υπολογισμός;",
          a: "Ναι. Ο γενέθλιος χάρτης και η βασική ερμηνεία στο MyZodiacMaps είναι δωρεάν και χωρίς εγγραφή.",
        },
      ],
      faqTitle: "Συχνές ερωτήσεις",
      ctaTitle: "Βρες τον ωροσκόπο σου τώρα",
      ctaText: "Χρειάζονται μόνο ημερομηνία, ώρα και τόπος γέννησης.",
      ctaLabel: "Δημιουργία γενέθλιου χάρτη",
      ctaHref: "/el",
    },
    readChart: {
      title: "Πώς διαβάζω τον γενέθλιο χάρτη μου",
      metaTitle: "Πώς διαβάζω τον γενέθλιο χάρτη μου — οδηγός βήμα-βήμα",
      description:
        "Οδηγός για αρχάριους: πλανήτες, ζώδια, σπίτια και όψεις. Μάθε με ποια σειρά να διαβάσεις τον γενέθλιο χάρτη σου και τι σημαίνει το καθένα.",
      intro:
        "Ο γενέθλιος χάρτης είναι ο ουρανός τη στιγμή που γεννήθηκες. Φαίνεται πολύπλοκος, αλλά διαβάζεται με μια απλή σειρά: πρώτα τα τρία βασικά σημεία, μετά τα σπίτια και τέλος οι όψεις.",
      sections: [
        {
          h: "Βήμα 1: Ήλιος, Σελήνη, Ωροσκόπος",
          p: [
            "Αυτή η τριάδα δίνει το 70% της εικόνας. Ο Ήλιος είναι το τι είσαι, η Σελήνη το τι νιώθεις και χρειάζεσαι, ο ωροσκόπος το πώς εμφανίζεσαι.",
            "Διάβασέ τα πάντα μαζί, όχι χωριστά: ένας Αιγόκερως με Σελήνη Ιχθύ και ωροσκόπο Λέοντα δεν μοιάζει με κανέναν άλλο Αιγόκερω.",
          ],
        },
        {
          h: "Βήμα 2: Οι πλανήτες και τι κυβερνά ο καθένας",
          p: [
            "Ερμής: σκέψη και επικοινωνία. Αφροδίτη: αγάπη, αξίες, αισθητική. Άρης: ενέργεια, ορμή, θυμός.",
            "Δίας: ανάπτυξη και ευκαιρίες. Κρόνος: όρια, ευθύνη, ωριμότητα — συνήθως το πιο διδακτικό σημείο του χάρτη.",
            "Ουρανός, Ποσειδώνας, Πλούτωνας κινούνται αργά και περιγράφουν περισσότερο τη γενιά σου, εκτός αν αγγίζουν προσωπικά σημεία.",
          ],
        },
        {
          h: "Βήμα 3: Τα δώδεκα σπίτια",
          p: [
            "Το ζώδιο δείχνει το πώς, το σπίτι δείχνει το πού. Ο ίδιος Άρης στο 10ο σπίτι μιλά για καριέρα· στο 7ο για σχέσεις.",
            "Δώσε προτεραιότητα στα σπίτια που έχουν δύο ή περισσότερους πλανήτες — εκεί συγκεντρώνεται η ενέργεια της ζωής σου.",
            "Τα κενά σπίτια δεν είναι «άδεια ζωή»: διαβάζονται μέσα από τον κυβερνήτη τους.",
          ],
        },
        {
          h: "Βήμα 4: Οι όψεις",
          p: [
            "Οι όψεις είναι οι γωνίες μεταξύ πλανητών. Σύνοδος και τρίγωνο ρέουν εύκολα, τετράγωνο και αντίθεση δημιουργούν ένταση που όμως φέρνει εξέλιξη.",
            "Ξεκίνα μόνο από τις όψεις προς Ήλιο, Σελήνη και ωροσκόπο. Οι υπόλοιπες προστίθενται αργότερα.",
          ],
        },
        {
          h: "Βήμα 5: Σύνθεση",
          p: [
            "Ψάξε επαναλήψεις. Αν τρία διαφορετικά στοιχεία λένε «χρειάζεσαι ελευθερία», αυτό είναι πραγματικό μοτίβο του χάρτη.",
            "Ο χάρτης δεν προβλέπει γεγονότα· περιγράφει τάσεις και επιλογές. Διάβασέ τον σαν εργαλείο αυτογνωσίας.",
          ],
        },
      ],
      faq: [
        {
          q: "Πόσο χρόνο θέλει για να μάθω να διαβάζω χάρτη;",
          a: "Τα βασικά (Ήλιος, Σελήνη, ωροσκόπος, σπίτια) μαθαίνονται σε λίγες ώρες. Η σύνθεση θέλει εξάσκηση σε πολλούς χάρτες.",
        },
        {
          q: "Τι διαβάζω πρώτο σε έναν χάρτη;",
          a: "Πάντα τον ωροσκόπο και τον κυβερνήτη του, μετά Ήλιο και Σελήνη, και μετά τους πλανήτες κατά σπίτι.",
        },
        {
          q: "Χρειάζομαι ακριβή ώρα γέννησης;",
          a: "Για τα σπίτια και τον ωροσκόπο ναι. Χωρίς ώρα μπορείς να διαβάσεις μόνο πλανήτες σε ζώδια και όψεις.",
        },
      ],
      faqTitle: "Συχνές ερωτήσεις",
      ctaTitle: "Δες τον δικό σου χάρτη",
      ctaText: "Υπολόγισε τον γενέθλιο χάρτη σου και διάβασε την ερμηνεία βήμα-βήμα.",
      ctaLabel: "Δημιουργία γενέθλιου χάρτη",
      ctaHref: "/el",
    },
    moon: {
      title: "Σε τι ζώδιο είναι η Σελήνη μου;",
      metaTitle: "Σε τι ζώδιο είναι η Σελήνη μου; Βρες τη δωρεάν",
      description:
        "Η Σελήνη δείχνει τις συναισθηματικές σου ανάγκες και τι σε κάνει να νιώθεις ασφάλεια. Δες πώς τη βρίσκεις δωρεάν και τι σημαίνει.",
      intro:
        "Το ζώδιο της Σελήνης σου είναι το ζώδιο όπου βρισκόταν η Σελήνη τη στιγμή που γεννήθηκες. Αλλάζει ζώδιο περίπου κάθε δυόμισι μέρες.",
      sections: [
        {
          h: "Σελήνη και ηλιακό ζώδιο",
          p: [
            "Ο Ήλιος περιγράφει τον πυρήνα και την κατεύθυνσή σου. Η Σελήνη περιγράφει τον εσωτερικό σου κόσμο: διαθέσεις, αντιδράσεις και την άνεση που χρειάζεσαι.",
          ],
        },
        {
          h: "Πώς βρίσκεις τη Σελήνη σου",
          p: [
            "Χρειάζεσαι ημερομηνία και πόλη γέννησης. Η ώρα την κάνει ακριβή, γιατί τις μέρες που η Σελήνη αλλάζει ζώδιο η ώρα αποφασίζει.",
            "Βάλε τα στοιχεία σου στον δωρεάν γενέθλιο χάρτη και θα δεις τη Σελήνη δίπλα στον Ήλιο και τον ωροσκόπο.",
          ],
        },
        {
          h: "Η Σελήνη ανά στοιχείο",
          p: [
            "Φωτιά: χρειάζεται ενθουσιασμό και ελευθερία. Γη: σταθερότητα και ρουτίνα. Αέρας: κουβέντα και χώρο για σκέψη. Νερό: εγγύτητα και συναισθηματικό βάθος.",
          ],
        },
      ],
      faq: [
        {
          q: "Μπορώ να βρω τη Σελήνη χωρίς ώρα γέννησης;",
          a: "Συνήθως ναι. Μόνο αν η Σελήνη άλλαξε ζώδιο τη μέρα που γεννήθηκες χρειάζεται η ώρα.",
        },
        {
          q: "Είναι δωρεάν;",
          a: "Ναι, ο χάρτης και η ερμηνεία του είναι δωρεάν χωρίς εγγραφή.",
        },
      ],
      faqTitle: "Συχνές ερωτήσεις",
      ctaTitle: "Βρες τη Σελήνη σου τώρα",
      ctaText: "Αρκούν ημερομηνία, ώρα και πόλη γέννησης.",
      ctaLabel: "Φτιάξε τον χάρτη σου",
      ctaHref: "/el",
    },
    calculator: {
      title: "Γενέθλιος χάρτης δωρεάν",
      metaTitle: "Γενέθλιος χάρτης δωρεάν με ερμηνεία",
      description:
        "Υπολόγισε δωρεάν τον γενέθλιο χάρτη σου: πλανήτες, οίκοι, όψεις, Ήλιος, Σελήνη και ωροσκόπος, με γραπτή ερμηνεία. Χωρίς εγγραφή.",
      intro:
        "Ο γενέθλιος χάρτης μετατρέπει ημερομηνία, ώρα και τόπο γέννησης σε χάρτη του ουρανού εκείνης της στιγμής. Το MyZodiacMaps τον υπολογίζει με ακριβή αστρονομικά δεδομένα και τον εξηγεί απλά.",
      sections: [
        {
          h: "Τι χρειάζεσαι",
          p: ["Ημερομηνία γέννησης, ώρα όσο πιο ακριβή γίνεται και πόλη γέννησης."],
        },
        {
          h: "Τι παίρνεις",
          p: [
            "Ήλιο, Σελήνη και ωροσκόπο, κάθε πλανήτη σε ζώδιο και οίκο, τις κύριες όψεις και γραπτή ερμηνεία που διαβάζει τον χάρτη ως σύνολο.",
          ],
        },
        {
          h: "Αποθήκευση χαρτών",
          p: ["Με δωρεάν λογαριασμό αποθηκεύεις χάρτες για σένα και τους δικούς σου στο «Οι χάρτες μου»."],
        },
      ],
      faq: [
        {
          q: "Είναι πραγματικά δωρεάν;",
          a: "Ναι, ο χάρτης και η βασική ερμηνεία είναι δωρεάν χωρίς εγγραφή.",
        },
        {
          q: "Ποιο σύστημα οίκων χρησιμοποιείτε;",
          a: "Ολόκληρα ζώδια (Whole Sign), το αρχαιότερο σύστημα, όπου κάθε ζώδιο είναι ένας ολόκληρος οίκος.",
        },
      ],
      faqTitle: "Συχνές ερωτήσεις",
      ctaTitle: "Υπολόγισε τον χάρτη σου",
      ctaText: "Χρειάζεται λιγότερο από ένα λεπτό.",
      ctaLabel: "Ξεκίνα",
      ctaHref: "/el",
    },
  },
  en: {
    rising: {
      title: "What is my rising sign?",
      metaTitle: "What Is My Rising Sign? Find Your Ascendant Free",
      description:
        "Your rising sign depends on your exact birth time and place. Learn what the ascendant means, how it differs from your sun sign, and calculate it free.",
      intro:
        "Your rising sign — the ascendant — is the zodiac sign that was coming up over the horizon at the moment you were born. It is not your sun sign: it changes roughly every two hours, so you need an accurate birth time.",
      sections: [
        {
          h: "Rising sign vs sun sign",
          p: [
            "Your sun sign is where the Sun sat on your birthday. It shifts once a month and it is the sign everyone already knows.",
            "The ascendant shifts every couple of hours. It is the doorway of your chart: how you come across, your first instinct in new situations, and the style you use to start things.",
            "Two people with the same sun sign but different risings often feel nothing alike — which is why a full birth chart says far more than a daily horoscope.",
          ],
        },
        {
          h: "What you need to find it",
          p: [
            "An exact birth date, a birth time as close to the minute as possible, and your birth city. The time is the critical part.",
            "If you do not know your birth time, check your birth certificate, hospital records, or ask a parent.",
            "Being off by 10–15 minutes rarely changes the rising sign, but if you were born near a sign change it can move whole houses of the chart.",
          ],
        },
        {
          h: "How to calculate it free on MyZodiacMaps",
          p: [
            "Enter your date, time and place of birth in the chart form. The calculation uses real ephemeris data and accounts for your birth time zone and daylight saving.",
            "You immediately get your rising sign, moon sign and every planet placed across the twelve houses, with a plain-English interpretation.",
            "No account is needed and your details stay on your device.",
          ],
        },
        {
          h: "What your rising sign reveals",
          p: [
            "The first impression you make and the outward posture of your personality.",
            "Your chart ruler: the planet that rules your ascendant becomes the single most important point in the whole chart.",
            "The house framework — which area of life (career, relationships, family, money) each planet actually lands in.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I find my rising sign without a birth time?",
          a: "Not accurately. Without a time you can still see your Sun and usually your Moon, but the ascendant and houses require the birth time.",
        },
        {
          q: "Is the rising sign more important than my sun sign?",
          a: "Not more important, complementary. The Sun shows your core, the ascendant shows how you express it outwardly.",
        },
        {
          q: "Does my rising sign change over time?",
          a: "No. It is fixed at the moment of birth and stays the same for life.",
        },
        {
          q: "Is the calculation free?",
          a: "Yes. The birth chart and its core interpretation on MyZodiacMaps are free and require no signup.",
        },
      ],
      faqTitle: "Frequently asked questions",
      ctaTitle: "Find your rising sign now",
      ctaText: "All it takes is your birth date, time and city.",
      ctaLabel: "Create your birth chart",
      ctaHref: "/en",
    },
    readChart: {
      title: "How to read your birth chart",
      metaTitle: "How to Read Your Birth Chart — Step-by-Step Guide",
      description:
        "A beginner-friendly guide to planets, signs, houses and aspects — the exact order to read a natal chart in and what each layer actually means.",
      intro:
        "Your birth chart is a snapshot of the sky at the moment you were born. It looks complicated, but it reads in a simple order: the big three first, then the houses, then the aspects.",
      sections: [
        {
          h: "Step 1: Sun, Moon, Rising",
          p: [
            "This trio carries about 70% of the picture. The Sun is what you are, the Moon is what you feel and need, the ascendant is how you show up.",
            "Read them together, never separately: a Capricorn with a Pisces Moon and Leo rising looks like no other Capricorn.",
          ],
        },
        {
          h: "Step 2: The planets and what each one governs",
          p: [
            "Mercury: thinking and communication. Venus: love, values, taste. Mars: drive, energy, anger.",
            "Jupiter: growth and opportunity. Saturn: limits, responsibility, maturity — usually the most instructive point in a chart.",
            "Uranus, Neptune and Pluto move slowly and describe your generation, unless they touch a personal point.",
          ],
        },
        {
          h: "Step 3: The twelve houses",
          p: [
            "A sign shows how, a house shows where. The same Mars in the 10th house speaks about career; in the 7th it speaks about relationships.",
            "Prioritise houses holding two or more planets — that is where your life energy concentrates.",
            "Empty houses are not empty life areas: you read them through their ruling planet.",
          ],
        },
        {
          h: "Step 4: The aspects",
          p: [
            "Aspects are the angles between planets. Conjunctions and trines flow easily; squares and oppositions create tension that drives growth.",
            "Start only with aspects to the Sun, Moon and ascendant. Add the rest later.",
          ],
        },
        {
          h: "Step 5: Synthesis",
          p: [
            "Look for repetition. If three separate placements say 'you need freedom', that is a real pattern in the chart.",
            "A chart does not predict events; it describes tendencies and choices. Read it as a self-knowledge tool.",
          ],
        },
      ],
      faq: [
        {
          q: "How long does it take to learn to read a chart?",
          a: "The basics — Sun, Moon, rising and houses — take a few hours. Synthesis takes practice across many charts.",
        },
        {
          q: "What should I read first in a chart?",
          a: "Always the ascendant and its ruler, then the Sun and Moon, then the planets house by house.",
        },
        {
          q: "Do I need an exact birth time?",
          a: "For houses and the ascendant, yes. Without a time you can only read planets in signs and their aspects.",
        },
      ],
      faqTitle: "Frequently asked questions",
      ctaTitle: "See your own chart",
      ctaText: "Calculate your birth chart and read the interpretation layer by layer.",
      ctaLabel: "Create your birth chart",
      ctaHref: "/en",
    },
    moon: {
      title: "What is my moon sign?",
      metaTitle: "What Is My Moon Sign? Free Moon Sign Calculator & Meaning",
      description:
        "Your moon sign shows your emotional needs and what makes you feel safe. Learn how to find your moon sign for free and what it means next to your sun and rising.",
      intro:
        "Your moon sign is the zodiac sign the Moon was in when you were born. The Moon changes sign about every two and a half days, so two people born in the same month can have very different moons.",
      sections: [
        {
          h: "Moon sign vs sun sign",
          p: [
            "Your sun sign describes your core identity and direction. Your moon sign describes your inner world: moods, emotional reactions and the comfort you need.",
            "Many people who 'don't feel like their sign' actually relate far more to their moon.",
          ],
        },
        {
          h: "How to find your moon sign",
          p: [
            "You need your birth date and city. A birth time makes it exact, because on days when the Moon changes sign the time decides which sign it is.",
            "Enter your details in the free birth chart calculator and your moon sign appears instantly next to your sun and rising sign.",
          ],
        },
        {
          h: "What the moon shows in each element",
          p: [
            "Fire moons (Aries, Leo, Sagittarius) need excitement and freedom. Earth moons (Taurus, Virgo, Capricorn) need stability and routine.",
            "Air moons (Gemini, Libra, Aquarius) need conversation and space to think. Water moons (Cancer, Scorpio, Pisces) need closeness and emotional depth.",
          ],
        },
        {
          h: "Reading the moon in your chart",
          p: [
            "Look at the house your Moon sits in: it shows the life area where you seek emotional security, such as home, work or relationships.",
            "Aspects to the Moon show how easily you express feelings. Trines feel smooth; squares bring intensity you learn to work with.",
          ],
        },
      ],
      faq: [
        {
          q: "Can I find my moon sign without a birth time?",
          a: "Usually yes. Only if the Moon changed sign on your birth day do you need the time to know which one it was.",
        },
        {
          q: "Is the moon sign important in relationships?",
          a: "Very. Comparing moon signs shows how two people comfort each other and handle emotions together.",
        },
        {
          q: "Is the moon sign calculator free?",
          a: "Yes. The MyZodiacMaps birth chart and its interpretation are free and need no signup.",
        },
      ],
      faqTitle: "Frequently asked questions",
      ctaTitle: "Find your moon sign now",
      ctaText: "Enter your birth date, time and city to see your moon, sun and rising sign.",
      ctaLabel: "Calculate my chart",
      ctaHref: "/en",
    },
    calculator: {
      title: "Free birth chart calculator",
      metaTitle: "Free Birth Chart Calculator — Natal Chart With Interpretation",
      description:
        "Calculate your natal chart for free: planets, houses, aspects and your big three (sun, moon, rising), with a clear written interpretation. No signup needed.",
      intro:
        "A birth chart calculator turns your birth date, time and place into a map of the sky at that moment. MyZodiacMaps calculates it with precise astronomical data and explains it in plain language.",
      sections: [
        {
          h: "What you need",
          p: [
            "Your date of birth, the time as exact as possible (check a birth certificate) and the city you were born in.",
            "Without a time you still get planets in signs, but the rising sign and houses will not be accurate.",
          ],
        },
        {
          h: "What you get",
          p: [
            "Your sun, moon and rising sign, every planet with its sign and house, the major aspects between them and a chart wheel.",
            "A written interpretation that reads the chart as a whole, describing tendencies, not fixed fate.",
          ],
        },
        {
          h: "How the calculation works",
          p: [
            "Your birth city is converted to coordinates and its historical time zone, including daylight saving at the time.",
            "Planet positions come from astronomical ephemeris data, and houses are calculated from the exact local time and place.",
          ],
        },
        {
          h: "Save and compare charts",
          p: [
            "Create a free account to save charts for yourself, your partner, friends or family and come back to them anytime from My Charts.",
          ],
        },
      ],
      faq: [
        {
          q: "Is this birth chart calculator really free?",
          a: "Yes. The chart and its core interpretation are free and require no signup.",
        },
        {
          q: "Which house system do you use?",
          a: "Whole Sign houses, the oldest house system, where each sign fills one whole house.",
        },
        {
          q: "Does it work for births outside Greece?",
          a: "Yes. Any city worldwide works, including the US, UK, Canada and Australia.",
        },
      ],
      faqTitle: "Frequently asked questions",
      ctaTitle: "Calculate your birth chart",
      ctaText: "It takes less than a minute.",
      ctaLabel: "Start my chart",
      ctaHref: "/en",
    },
  },
};

export function guide(key: GuideKey, lang: Lang): GuideContent {
  return GUIDES[lang][key];
}

/** head() for a guide page: unique meta + canonical + hreflang + FAQ/Article JSON-LD. */
export function guideHead(key: GuideKey, lang: Lang) {
  const g = guide(key, lang);
  const title = `${g.metaTitle} | MyZodiacMaps`;
  const elPath = guidePath(key, "el");
  const enPath = guidePath(key, "en");
  const current = lang === "el" ? elPath : enPath;
  const url = `${SITE_URL}${current}`;

  return {
    meta: [
      { title },
      { name: "description", content: g.description },
      { property: "og:title", content: title },
      { property: "og:description", content: g.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "el", href: `${SITE_URL}${elPath}` },
      { rel: "alternate", hrefLang: "en", href: `${SITE_URL}${enPath}` },
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${elPath}` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: g.title,
              description: g.description,
              inLanguage: lang,
              mainEntityOfPage: url,
              publisher: { "@type": "Organization", name: "MyZodiacMaps", url: SITE_URL },
            },
            {
              "@type": "FAQPage",
              mainEntity: g.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "MyZodiacMaps", item: `${SITE_URL}/${lang}` },
                { "@type": "ListItem", position: 2, name: g.title, item: url },
              ],
            },
          ],
        }),
      },
    ],
  };
}
