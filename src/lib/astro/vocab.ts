import { z } from "zod";

/** Single source of truth for the astrology vocabulary accepted from clients. */

export const SIGNS = [
  "Κριός",
  "Ταύρος",
  "Δίδυμοι",
  "Καρκίνος",
  "Λέων",
  "Παρθένος",
  "Ζυγός",
  "Σκορπιός",
  "Τοξότης",
  "Αιγόκερως",
  "Υδροχόος",
  "Ιχθύες",
] as const;

export const PLANETS = [
  "Ήλιος",
  "Σελήνη",
  "Ερμής",
  "Αφροδίτη",
  "Άρης",
  "Δίας",
  "Κρόνος",
  "Ουρανός",
  "Ποσειδώνας",
  "Πλούτωνας",
] as const;

export const ASPECTS = [
  { label: "σύνοδος", angle: 0 },
  { label: "εξάγωνο", angle: 60 },
  { label: "τετράγωνο", angle: 90 },
  { label: "τρίγωνο", angle: 120 },
  { label: "αντίθεση", angle: 180 },
] as const;

export const ASPECT_LABELS = ASPECTS.map((a) => a.label) as unknown as [string, ...string[]];
export const ASPECT_ANGLE: Record<string, number> = Object.fromEntries(
  ASPECTS.map((a) => [a.label, a.angle]),
);

export const signEnum = z.enum(SIGNS);
export const planetEnum = z.enum(PLANETS);
export const aspectEnum = z.enum(ASPECT_LABELS);

export const houseSchema = z.number().int().min(1).max(12);
export const degreeSchema = z.number().min(0).max(360);
export const orbSchema = z.number().min(0).max(15);
const countSchema = z.number().int().min(0).max(20);

/** Strict validation of the engine → AI chart contract. */
export const chartJsonSchema = z
  .object({
    chartHash: z.string().max(128),
    houseSystem: z.enum(["placidus", "whole_sign"]),
    angles: z
      .object({
        asc: z.object({ sign: signEnum, degree: degreeSchema }).strict(),
        mc: z.object({ sign: signEnum, degree: degreeSchema }).strict(),
      })
      .strict(),
    planets: z
      .array(
        z
          .object({
            name: planetEnum,
            sign: signEnum,
            degree: degreeSchema,
            house: houseSchema,
            retrograde: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    aspects: z
      .array(
        z
          .object({
            a: planetEnum,
            b: planetEnum,
            type: aspectEnum,
            angle: z.number().min(0).max(360),
            orb: orbSchema,
            applying: z.boolean(),
          })
          .strict()
          .refine((v) => ASPECT_ANGLE[v.type] === v.angle, { message: "aspect_angle_mismatch" }),
      )
      .max(200),
    balance: z
      .object({
        elements: z
          .object({
            fire: countSchema,
            earth: countSchema,
            air: countSchema,
            water: countSchema,
          })
          .strict(),
        modalities: z
          .object({
            cardinal: countSchema,
            fixed: countSchema,
            mutable: countSchema,
          })
          .strict(),
      })
      .strict(),
  })
  .strict();
