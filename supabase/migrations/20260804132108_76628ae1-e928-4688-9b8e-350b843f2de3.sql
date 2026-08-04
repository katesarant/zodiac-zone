-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  locale text DEFAULT 'el',
  charts_quota int DEFAULT 3,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

-- charts
CREATE TABLE public.charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_favorite boolean NOT NULL DEFAULT false,
  birth_date date NOT NULL,
  birth_time time,
  birth_place text,
  lat numeric,
  lon numeric,
  tz text,
  utc_offset numeric,
  chart_json jsonb NOT NULL,
  chart_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.charts TO authenticated;
GRANT ALL ON public.charts TO service_role;
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "charts_select_own" ON public.charts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "charts_insert_own" ON public.charts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "charts_update_own" ON public.charts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "charts_delete_own" ON public.charts FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX charts_user_id_idx ON public.charts (user_id);
CREATE INDEX charts_user_id_is_favorite_idx ON public.charts (user_id, is_favorite);
CREATE INDEX charts_chart_hash_idx ON public.charts (chart_hash);

-- interpretations: shared cache, no user_id by design
CREATE TABLE public.interpretations (
  chart_hash text NOT NULL,
  lang text NOT NULL,
  kind text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (chart_hash, lang, kind)
);
GRANT SELECT ON public.interpretations TO anon;
GRANT SELECT ON public.interpretations TO authenticated;
GRANT ALL ON public.interpretations TO service_role;
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interpretations_public_read" ON public.interpretations FOR SELECT TO anon, authenticated USING (true);
-- no insert/update policies: writes happen only through the service role

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER charts_set_updated_at
  BEFORE UPDATE ON public.charts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- quota enforcement
CREATE OR REPLACE FUNCTION public.enforce_charts_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quota int;
  used int;
BEGIN
  SELECT COALESCE(p.charts_quota, 3) INTO quota
  FROM public.profiles p WHERE p.id = NEW.user_id;
  IF quota IS NULL THEN
    quota := 3;
  END IF;
  SELECT count(*) INTO used FROM public.charts c WHERE c.user_id = NEW.user_id;
  IF used >= quota THEN
    RAISE EXCEPTION 'charts_quota_exceeded: limit of % charts reached', quota
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER charts_enforce_quota
  BEFORE INSERT ON public.charts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_charts_quota();

-- profile auto-creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();