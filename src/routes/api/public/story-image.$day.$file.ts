import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves a rendered story image from private storage under a stable public URL,
 * which is what the Instagram Graph API needs to fetch the media.
 */
export const Route = createFileRoute("/api/public/story-image/$day/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { day, file } = params as { day: string; file: string };
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^[a-z]+\.png$/.test(file)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("story-renders")
          .download(`${day}/${file}`);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
