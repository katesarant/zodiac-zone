import type { Horoscope, Lang } from "@/lib/astro/types";
import { formatLongDate, SIGN_SLUGS, SITE_URL } from "@/lib/horoscope/signs";
import { ensureWasm, renderStoryPng, type StoryFonts } from "@/lib/stories/render.server";

export const STORY_BG_BUCKET = "story-backgrounds";
export const STORY_RENDER_BUCKET = "story-renders";

/** Backgrounds are keyed by the English slug so they read well in storage. */
export function backgroundName(index: number): string {
  return `${SIGN_SLUGS.en[index]}.jpg`;
}

export function renderPath(day: string, index: number, lang: Lang): string {
  return `${day}/${SIGN_SLUGS[lang][index]}.png`;
}

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

let fontsPromise: Promise<StoryFonts> | null = null;

async function loadFonts(admin: Admin): Promise<StoryFonts> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const [regular, bold] = await Promise.all([
        admin.storage.from(STORY_BG_BUCKET).download("_fonts/NotoSans-Regular.ttf"),
        admin.storage.from(STORY_BG_BUCKET).download("_fonts/NotoSans-Bold.ttf"),
      ]);
      if (regular.error || !regular.data) throw new Error(`font download failed: ${regular.error?.message}`);
      if (bold.error || !bold.data) throw new Error(`font download failed: ${bold.error?.message}`);
      return { regular: await regular.data.arrayBuffer(), bold: await bold.data.arrayBuffer() };
    })().catch((err) => {
      fontsPromise = null;
      throw err;
    });
  }
  return fontsPromise;
}

function firstSentence(text: string, max = 120): string {
  const clean = text.trim().replace(/\s+/g, " ");
  const dot = clean.indexOf(". ");
  const head = dot > 30 ? clean.slice(0, dot + 1) : clean;
  return head.length > max ? `${head.slice(0, max - 1).trimEnd()}…` : head;
}

function clamp(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export interface RenderedStory {
  index: number;
  sign: string;
  path: string;
  imageUrl: string;
}

/**
 * Renders the 12 daily story images for `day` and stores them in the
 * story-renders bucket. Existing renders are overwritten.
 */
export async function renderDailyStories(
  admin: Admin,
  day: string,
  lang: Lang = "el",
): Promise<RenderedStory[]> {
  const { data: row, error } = await admin
    .from("horoscopes")
    .select("signs")
    .eq("period", "daily")
    .eq("lang", lang)
    .eq("key", day)
    .maybeSingle();
  if (error) throw new Error(`horoscope lookup failed: ${error.message}`);
  const signs = (row?.signs ?? []) as unknown as Horoscope[];
  if (signs.length < 12) throw new Error(`no daily reading stored for ${day} (${lang})`);

  const fonts = await loadFonts(admin);
  await ensureWasm(async () => {
    const wasm = await admin.storage.from(STORY_BG_BUCKET).download("_wasm/resvg.wasm");
    if (wasm.error || !wasm.data) throw new Error(`resvg wasm missing: ${wasm.error?.message}`);
    return wasm.data.arrayBuffer();
  });
  const dateLabel = formatLongDate(day, lang);
  const out: RenderedStory[] = [];

  for (let index = 0; index < 12; index++) {
    const reading = signs[index]!;
    const bg = await admin.storage.from(STORY_BG_BUCKET).download(backgroundName(index));
    if (bg.error || !bg.data) throw new Error(`background missing: ${backgroundName(index)}`);

    const png = await renderStoryPng(
      {
        sign: reading.sign,
        eyebrow: lang === "en" ? "Daily horoscope" : "Ημερήσια πρόβλεψη",
        dateLabel,
        headline: firstSentence(reading.tone || reading.sky || ""),
        body: clamp(reading.focus || reading.sky || "", 220),
        footer: "myzodiacmaps.gr",
        background: new Uint8Array(await bg.data.arrayBuffer()),
        backgroundType: "image/jpeg",
      },
      fonts,
    );

    const path = renderPath(day, index, lang);
    const up = await admin.storage
      .from(STORY_RENDER_BUCKET)
      .upload(path, png, { contentType: "image/png", upsert: true });
    if (up.error) throw new Error(`story upload failed (${path}): ${up.error.message}`);

    out.push({
      index,
      sign: reading.sign,
      path,
      imageUrl: `${SITE_URL}/api/public/story-image/${day}/${SIGN_SLUGS[lang][index]}.png`,
    });
  }

  return out;
}
