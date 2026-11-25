REVOKE ALL PRIVILEGES ON TABLE public.analytics_config FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.analytics_config TO service_role;
ALTER TABLE public.analytics_config ENABLE ROW LEVEL SECURITY;