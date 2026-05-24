CREATE TABLE IF NOT EXISTS public.goal_mission_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_slug TEXT NOT NULL,
  completed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_slug, completed_on)
);

ALTER TABLE public.goal_mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goal completions"
ON public.goal_mission_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all goal completions"
ON public.goal_mission_completions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_goal_completions_user_day
  ON public.goal_mission_completions (user_id, completed_on);
