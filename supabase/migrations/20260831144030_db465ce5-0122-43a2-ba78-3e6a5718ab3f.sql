CREATE TABLE public.publish_watch_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  token text NOT NULL
);

GRANT ALL ON public.publish_watch_config TO service_role;

ALTER TABLE public.publish_watch_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.publish_watch_config (id, token)
VALUES (true, encode(gen_random_bytes(24), 'hex'));