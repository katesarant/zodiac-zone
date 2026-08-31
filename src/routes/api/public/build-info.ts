import { createFileRoute } from "@tanstack/react-router";

declare const __BUILD_STAMP__: string | undefined;

/** Public, read-only build stamp — used to detect when a new version was published. */
export const Route = createFileRoute("/api/public/build-info")({
  server: {
    handlers: {
      GET: () => {
        const buildStamp = typeof __BUILD_STAMP__ === "string" ? __BUILD_STAMP__ : "dev";
        return new Response(JSON.stringify({ buildStamp }), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
