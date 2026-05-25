
CREATE TYPE public.job_stage AS ENUM ('wishlist','applied','phone_screen','interview','final_round','offer','closed');
CREATE TYPE public.job_priority AS ENUM ('high','medium','low');

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT,
  jd_text TEXT,
  ctc_min NUMERIC,
  ctc_max NUMERIC,
  source TEXT,
  recruiter_name TEXT,
  recruiter_contact TEXT,
  target_start_date DATE,
  priority public.job_priority NOT NULL DEFAULT 'medium',
  notes TEXT DEFAULT '',
  stage public.job_stage NOT NULL DEFAULT 'wishlist',
  stage_entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stage_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_user ON public.jobs(user_id);
CREATE INDEX idx_jobs_stage ON public.jobs(user_id, stage);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all jobs" ON public.jobs FOR SELECT USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER jobs_touch_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
