GRANT SELECT ON public.interpretations TO anon, authenticated;
GRANT ALL ON public.interpretations TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS interpretations_key_uidx
  ON public.interpretations (chart_hash, lang, kind);