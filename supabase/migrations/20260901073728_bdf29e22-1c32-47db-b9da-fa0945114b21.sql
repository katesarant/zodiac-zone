CREATE TABLE public.horoscopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL CHECK (period IN ('daily','month','year')),
  key text NOT NULL,
  lang text NOT NULL CHECK (lang IN ('el','en')),
  signs jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period, key, lang)
);

CREATE INDEX horoscopes_period_lang_key_idx ON public.horoscopes (period, lang, key DESC);

GRANT SELECT ON public.horoscopes TO anon;
GRANT SELECT ON public.horoscopes TO authenticated;
GRANT ALL ON public.horoscopes TO service_role;

ALTER TABLE public.horoscopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Horoscopes are public to read"
  ON public.horoscopes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.horoscope_cron_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.horoscope_cron_config TO service_role;
ALTER TABLE public.horoscope_cron_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.horoscope_cron_config (token)
VALUES (encode(gen_random_bytes(32), 'hex'));