DROP TRIGGER IF EXISTS charts_enforce_quota ON public.charts;
DROP TRIGGER IF EXISTS charts_set_updated_at ON public.charts;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.enforce_charts_quota();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.charts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;