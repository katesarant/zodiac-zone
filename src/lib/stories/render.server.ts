import { initWasm, Resvg } from "@resvg/resvg-wasm";
import satori from "satori";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

let wasmReady: Promise<void> | null = null;

/**
 * The resvg wasm binary cannot be bundled for the edge worker, so it is stored
 * alongside the artwork and initialised once per isolate.
 */
export async function ensureWasm(load: () => Promise<ArrayBuffer>) {
  if (!wasmReady) {
    wasmReady = (async () => {
      try {
        await initWasm(await load());
      } catch (err) {
        // A hot-reloaded module loses the flag while the runtime stays initialised.
        if (!String(err).includes("Already initialized")) throw err;
      }
    })().catch((err) => {
      wasmReady = null;
      throw err;
    });
  }
  await wasmReady;
}

export interface StoryFonts {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
}

export interface StoryContent {
  /** Localised sign name, e.g. "Κριός". */
  sign: string;
  /** Short label above the sign name, e.g. the period. */
  eyebrow: string;
  /** "Δευτέρα 1 Σεπτεμβρίου 2026" */
  dateLabel: string;
  /** Short lead line. */
  headline: string;
  /** Two or three sentences. */
  body: string;
  /** Small footer line, e.g. "myzodiacmaps.gr". */
  footer: string;
  /** JPEG/PNG bytes of the background artwork. */
  background: Uint8Array;
  backgroundType: "image/jpeg" | "image/png";
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Satori accepts plain element objects — no JSX/React needed on the server. */
type El = { type: string; props: Record<string, unknown> };

function el(type: string, props: Record<string, unknown>): El {
  return { type, props };
}

function buildTree(content: StoryContent): El {
  const bgUri = `data:${content.backgroundType};base64,${toBase64(content.background)}`;

  return el("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      backgroundColor: "#0b1030",
      backgroundImage: `url(${bgUri})`,
      backgroundSize: `${STORY_WIDTH}px ${STORY_HEIGHT}px`,
      fontFamily: "Noto Sans",
      color: "#f6f1e4",
    },
    children: [
     el("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        // Keeps the copy readable over the busiest part of the artwork.
        backgroundImage:
          "linear-gradient(to top, rgba(4,8,26,0.94), rgba(4,8,26,0.86) 55%, rgba(4,8,26,0))",
        padding: "220px 88px 150px 88px",
      },
      children: [
      el("div", {
        style: {
          display: "flex",
          fontSize: 28,
          letterSpacing: "6px",
          color: "rgba(230, 184, 98, 0.85)",
        },
        children: content.eyebrow.toUpperCase(),
      }),
      el("div", {
        style: {
          display: "flex",
          marginTop: "10px",
          fontSize: 58,
          fontWeight: 700,
          letterSpacing: "2px",
          color: "#e6b862",
        },
        children: content.sign.toUpperCase(),
      }),
      el("div", {
        style: {
          display: "flex",
          marginTop: "18px",
          fontSize: 34,
          color: "rgba(246, 241, 228, 0.72)",
        },
        children: content.dateLabel,
      }),
      el("div", {
        style: {
          display: "flex",
          marginTop: "44px",
          fontSize: 62,
          fontWeight: 700,
          lineHeight: 1.2,
        },
        children: content.headline,
      }),
      el("div", {
        style: {
          display: "flex",
          marginTop: "34px",
          fontSize: 40,
          lineHeight: 1.45,
          color: "rgba(246, 241, 228, 0.9)",
        },
        children: content.body,
      }),
      el("div", {
        style: {
          display: "flex",
          marginTop: "62px",
          fontSize: 32,
          letterSpacing: "3px",
          color: "#e6b862",
        },
        children: content.footer,
      }),
      ],
     }),
    ],
  });
}

/** Renders one 1080x1920 story as PNG bytes. */
export async function renderStoryPng(content: StoryContent, fonts: StoryFonts): Promise<Uint8Array> {
  const svg = await satori(buildTree(content) as unknown as React.ReactNode, {
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    fonts: [
      { name: "Noto Sans", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: fonts.bold, weight: 700, style: "normal" },
    ],
  });

  // Callers must have initialised the wasm renderer via ensureWasm().
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: STORY_WIDTH } });
  return resvg.render().asPng();
}
