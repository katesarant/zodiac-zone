CREATE TABLE public.instagram_reels_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  theme text,
  scheduled_for date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  ig_media_id text,
  error text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.instagram_reels_queue TO service_role;
ALTER TABLE public.instagram_reels_queue ENABLE ROW LEVEL SECURITY;
CREATE INDEX ON public.instagram_reels_queue (status, scheduled_for);