CREATE TABLE public.instagram_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_user_id text,
  access_token text,
  token_expires_at timestamptz,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.instagram_config TO service_role;
ALTER TABLE public.instagram_config ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  sign text NOT NULL,
  lang text NOT NULL DEFAULT 'el',
  status text NOT NULL DEFAULT 'pending',
  image_url text,
  media_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, sign, lang)
);
GRANT ALL ON public.instagram_posts TO service_role;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.page_views (
  id bigserial PRIMARY KEY,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Athens')::date,
  path text NOT NULL,
  lang text,
  referrer_host text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_day_idx ON public.page_views (day);
CREATE INDEX page_views_path_idx ON public.page_views (path);
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.analytics_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.analytics_config TO service_role;
ALTER TABLE public.analytics_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.analytics_config (password) VALUES (encode(gen_random_bytes(9), 'base64'));
INSERT INTO public.instagram_config (enabled) VALUES (false);