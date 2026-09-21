CREATE TABLE public.career_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  proof_type text NOT NULL,
  description text NOT NULL DEFAULT '',
  impact text NOT NULL DEFAULT '',
  metric text NOT NULL DEFAULT '',
  proof_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT career_proofs_title_length CHECK (char_length(title) BETWEEN 1 AND 160),
  CONSTRAINT career_proofs_type_length CHECK (char_length(proof_type) BETWEEN 1 AND 60)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_proofs TO authenticated;
GRANT ALL ON public.career_proofs TO service_role;

ALTER TABLE public.career_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own career proofs"
ON public.career_proofs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all career proofs"
ON public.career_proofs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX career_proofs_user_date_idx
ON public.career_proofs (user_id, proof_date DESC, created_at DESC);

CREATE TRIGGER career_proofs_touch_updated_at
BEFORE UPDATE ON public.career_proofs
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  moved_forward text NOT NULL DEFAULT '',
  blockers text NOT NULL DEFAULT '',
  next_priority text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage own weekly reviews"
ON public.weekly_reviews
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all weekly reviews"
ON public.weekly_reviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX weekly_reviews_user_week_idx
ON public.weekly_reviews (user_id, week_start DESC);

CREATE TRIGGER weekly_reviews_touch_updated_at
BEFORE UPDATE ON public.weekly_reviews
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();