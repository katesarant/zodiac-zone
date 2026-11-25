DROP POLICY IF EXISTS interpretations_public_read ON public.interpretations;
REVOKE ALL PRIVILEGES ON TABLE public.interpretations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.interpretations TO service_role;
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;