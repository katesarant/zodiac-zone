import { z } from "zod";

/** Γράμματα (ελληνικά + λατινικά), κενά και λίγα σημεία στίξης για ονόματα. */
export const NAME_RE = /^[A-Za-zΑ-Ωα-ωΆΈΉΊΌΎΏάέήίόύώϊϋΐΰΪΫ .'-]+$/;

/** Γράμματα, αριθμοί και συγκεκριμένοι ειδικοί χαρακτήρες για θέμα/μήνυμα. */
export const TEXT_RE = /^[A-Za-zΑ-Ωα-ωΆΈΉΊΌΎΏάέήίόύώϊϋΐΰΪΫ0-9\s.,;:!?'"()\-@&%+/\n\r]+$/;

export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(NAME_RE),
  email: z.string().trim().toLowerCase().min(5).max(160).regex(EMAIL_RE),
  subject: z.string().trim().max(120).regex(TEXT_RE).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000).regex(TEXT_RE),
  lang: z.enum(["el", "en"]).default("el"),
  captchaToken: z.string().min(10).max(400),
  captchaAnswer: z.string().trim().regex(/^\d{1,3}$/),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Αφαιρεί οτιδήποτε εκτός των επιτρεπόμενων χαρακτήρων, καθώς πληκτρολογεί ο χρήστης. */
export function sanitizeName(value: string) {
  return value.replace(/[^A-Za-zΑ-Ωα-ωΆΈΉΊΌΎΏάέήίόύώϊϋΐΰΪΫ .'-]/g, "");
}

export function sanitizeText(value: string) {
  return value.replace(/[^A-Za-zΑ-Ωα-ωΆΈΉΊΌΎΏάέήίόύώϊϋΐΰΪΫ0-9\s.,;:!?'"()\-@&%+/]/g, "");
}

export function sanitizeEmail(value: string) {
  return value.replace(/[^A-Za-z0-9._%+@-]/g, "");
}
