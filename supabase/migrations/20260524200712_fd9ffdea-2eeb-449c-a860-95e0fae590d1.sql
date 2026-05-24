CREATE TABLE public.user_courses (
  user_id uuid NOT NULL,
  course_slug text NOT NULL,
  completed_modules integer[] NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  course_completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_slug)
);
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own course progress" ON public.user_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own course progress" ON public.user_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own course progress" ON public.user_courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all course progress" ON public.user_courses FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_user_courses BEFORE UPDATE ON public.user_courses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();