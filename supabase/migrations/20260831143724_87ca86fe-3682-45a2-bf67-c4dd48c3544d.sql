CREATE TABLE public.publish_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build_stamp text NOT NULL UNIQUE,
  detected_at timestamptz NOT NULL DEFAULT now(),
  calendar_event_id text
);

GRANT ALL ON public.publish_events TO service_role;

ALTER TABLE public.publish_events ENABLE ROW LEVEL SECURITY;