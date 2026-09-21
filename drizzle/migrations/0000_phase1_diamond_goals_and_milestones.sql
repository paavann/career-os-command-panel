CREATE TABLE public.diamond_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_role TEXT,
  target_date DATE NOT NULL,
  timeline TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diamond_goals TO authenticated;
GRANT ALL ON public.diamond_goals TO service_role;

ALTER TABLE public.diamond_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own Diamond goals"
ON public.diamond_goals
FOR ALL
TO authenticated
USING (auth.uid() = member_id)
WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admins view all Diamond goals"
ON public.diamond_goals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE UNIQUE INDEX diamond_goals_one_active_per_member
ON public.diamond_goals (member_id)
WHERE status = 'active';

CREATE INDEX diamond_goals_member_updated_idx
ON public.diamond_goals (member_id, updated_at DESC);

CREATE TRIGGER diamond_goals_touch_updated_at
BEFORE UPDATE ON public.diamond_goals
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.diamond_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_milestones TO authenticated;
GRANT ALL ON public.goal_milestones TO service_role;

ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own goal milestones"
ON public.goal_milestones
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.diamond_goals g
  WHERE g.id = goal_id AND g.member_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.diamond_goals g
  WHERE g.id = goal_id AND g.member_id = auth.uid()
));

CREATE POLICY "Admins view all goal milestones"
ON public.goal_milestones
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX goal_milestones_goal_order_idx
ON public.goal_milestones (goal_id, sort_order);

CREATE TRIGGER goal_milestones_touch_updated_at
BEFORE UPDATE ON public.goal_milestones
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.refresh_diamond_goal_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_goal UUID;
  total_count INTEGER;
  completed_count INTEGER;
  next_progress INTEGER;
BEGIN
  affected_goal := COALESCE(NEW.goal_id, OLD.goal_id);

  SELECT count(*), count(*) FILTER (WHERE completed)
  INTO total_count, completed_count
  FROM public.goal_milestones
  WHERE goal_id = affected_goal;

  next_progress := CASE
    WHEN total_count = 0 THEN 0
    ELSE round((completed_count::numeric / total_count::numeric) * 100)::integer
  END;

  UPDATE public.diamond_goals
  SET progress = next_progress,
      status = CASE WHEN total_count > 0 AND completed_count = total_count THEN 'completed' ELSE 'active' END
  WHERE id = affected_goal;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_diamond_goal_progress() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.refresh_diamond_goal_progress() TO service_role;

CREATE TRIGGER refresh_diamond_goal_progress_after_milestone
AFTER INSERT OR UPDATE OF completed OR DELETE ON public.goal_milestones
FOR EACH ROW EXECUTE FUNCTION public.refresh_diamond_goal_progress();

CREATE UNIQUE INDEX goal_mission_foundation_once_idx
ON public.goal_mission_completions (user_id, mission_slug)
WHERE mission_slug LIKE 'diamond-foundation:%';