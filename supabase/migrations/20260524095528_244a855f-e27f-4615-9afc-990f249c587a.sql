
-- Roles enum + table (separate from profile for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Operator',
  avatar_url TEXT,
  headline TEXT,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  coins INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  cpi_score INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'L1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Career scores (C.A.R.E.E.R.)
CREATE TABLE public.career_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clarity INT NOT NULL DEFAULT 0,
  authority INT NOT NULL DEFAULT 0,
  reach INT NOT NULL DEFAULT 0,
  evidence INT NOT NULL DEFAULT 0,
  energy INT NOT NULL DEFAULT 0,
  revenue INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.career_scores ENABLE ROW LEVEL SECURITY;

-- Missions catalog
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INT NOT NULL DEFAULT 25,
  coin_reward INT NOT NULL DEFAULT 5,
  category TEXT NOT NULL DEFAULT 'daily',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- User mission progress
CREATE TABLE public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- XP event log
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===== RLS POLICIES =====

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Profiles readable by all signed-in" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- career_scores
CREATE POLICY "Users view own scores" ON public.career_scores
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON public.career_scores
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON public.career_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all scores" ON public.career_scores
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- missions
CREATE POLICY "Missions readable by signed-in" ON public.missions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage missions" ON public.missions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_missions
CREATE POLICY "Users view own user_missions" ON public.user_missions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own user_missions" ON public.user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own user_missions" ON public.user_missions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all user_missions" ON public.user_missions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- xp_events
CREATE POLICY "Users view own xp_events" ON public.xp_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all xp_events" ON public.xp_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ===== TRIGGERS / FUNCTIONS =====

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER career_scores_touch BEFORE UPDATE ON public.career_scores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- New user signup → create profile, scores, role, attach all active missions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Operator')
  );
  INSERT INTO public.career_scores (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  INSERT INTO public.user_missions (user_id, mission_id)
    SELECT NEW.id, id FROM public.missions WHERE active = true AND category = 'daily';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Award XP, level up, update streak atomically
CREATE OR REPLACE FUNCTION public.award_xp(_user_id UUID, _amount INT, _source TEXT, _coins INT DEFAULT 0)
RETURNS TABLE(new_xp INT, new_level INT, new_coins INT, new_streak INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_xp INT; cur_level INT; cur_coins INT; cur_streak INT; cur_last DATE;
  upd_streak INT; computed_level INT;
BEGIN
  SELECT xp, level, coins, streak_days, last_active_date
    INTO cur_xp, cur_level, cur_coins, cur_streak, cur_last
  FROM public.profiles WHERE id = _user_id FOR UPDATE;

  IF cur_last IS NULL THEN upd_streak := 1;
  ELSIF cur_last = CURRENT_DATE THEN upd_streak := GREATEST(cur_streak, 1);
  ELSIF cur_last = CURRENT_DATE - 1 THEN upd_streak := cur_streak + 1;
  ELSE upd_streak := 1;
  END IF;

  cur_xp := cur_xp + _amount;
  computed_level := GREATEST(1, 1 + (cur_xp / 500));

  UPDATE public.profiles
     SET xp = cur_xp,
         level = computed_level,
         coins = cur_coins + _coins,
         streak_days = upd_streak,
         last_active_date = CURRENT_DATE
   WHERE id = _user_id;

  INSERT INTO public.xp_events (user_id, amount, source) VALUES (_user_id, _amount, _source);

  RETURN QUERY SELECT cur_xp, computed_level, cur_coins + _coins, upd_streak;
END;
$$;

-- Seed default daily missions
INSERT INTO public.missions (title, description, xp_reward, coin_reward, category) VALUES
  ('Daily Power Post', 'Publish one authority post on LinkedIn', 50, 10, 'daily'),
  ('Outreach 3 Targets', 'Send 3 personalized DMs to dream-role decision makers', 75, 15, 'daily'),
  ('Sharpen Your Pitch', 'Refine your 30-second positioning statement', 30, 5, 'daily'),
  ('Career Identity Scan', 'Run the Identity Scanner and review insights', 100, 20, 'weekly'),
  ('Proof-of-Impact Brick', 'Document one quantified result from this week', 60, 10, 'weekly');
