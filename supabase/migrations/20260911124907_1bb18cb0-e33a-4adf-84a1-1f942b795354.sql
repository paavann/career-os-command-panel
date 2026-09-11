CREATE TABLE public.members (
  id uuid PRIMARY KEY,
  access_code_hash text NOT NULL,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  role_title text,
  industry text,
  years_experience integer,
  career_goal text,
  target_timeline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.clarity_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb, followup_transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  clarity_score integer NOT NULL, specificity_score integer NOT NULL, market_gap_score integer NOT NULL, velocity_score integer NOT NULL,
  score_reasoning text NOT NULL, persona_statement text NOT NULL, positioning_headlines jsonb NOT NULL DEFAULT '[]'::jsonb,
  north_star_role text NOT NULL, power_signals jsonb NOT NULL DEFAULT '[]'::jsonb, market_gap_analysis text NOT NULL, upskill_plan text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.clarity_sessions TO service_role;
ALTER TABLE public.clarity_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.authority_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb, followup_transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  authority_score integer NOT NULL, thought_leadership_score integer NOT NULL, consistency_score integer NOT NULL,
  recognition_score integer NOT NULL, framework_strength_score integer NOT NULL, score_reasoning text NOT NULL,
  framework_name text NOT NULL, framework_structure jsonb NOT NULL DEFAULT '[]'::jsonb, framework_illustration text NOT NULL,
  authority_audit text NOT NULL, this_weeks_action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.authority_sessions TO service_role;
ALTER TABLE public.authority_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reach_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb, followup_transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  reach_score integer NOT NULL, brand_score integer NOT NULL, find_people_score integer NOT NULL,
  insights_score integer NOT NULL, relationships_score integer NOT NULL, score_reasoning text NOT NULL,
  seven_day_sprint jsonb NOT NULL DEFAULT '[]'::jsonb, thirty_day_trajectory jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibility_audit text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.reach_sessions TO service_role;
ALTER TABLE public.reach_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.evidence_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  raw_input text NOT NULL, polished_bullet text NOT NULL, quality_score integer NOT NULL, quality_note text NOT NULL DEFAULT '', category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), edited_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.evidence_entries TO service_role;
ALTER TABLE public.evidence_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.energy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb, followup_transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  energy_score integer NOT NULL, clarity_thought_score integer NOT NULL, command_room_score integer NOT NULL,
  composure_score integer NOT NULL, conviction_score integer NOT NULL, consideration_score integer NOT NULL,
  score_reasoning text NOT NULL, fixes_list jsonb NOT NULL DEFAULT '[]'::jsonb, weekly_practice jsonb NOT NULL DEFAULT '[]'::jsonb,
  practice_checks jsonb NOT NULL DEFAULT '[]'::jsonb, presence_audit text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.energy_sessions TO service_role;
ALTER TABLE public.energy_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.energy_rewrites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  original_text text NOT NULL, rewritten_text text NOT NULL, what_changed jsonb NOT NULL DEFAULT '[]'::jsonb, context_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.energy_rewrites TO service_role;
ALTER TABLE public.energy_rewrites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.revenue_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb, market_alignment_score integer NOT NULL, negotiation_readiness_score integer NOT NULL,
  revenue_score integer NOT NULL, score_reasoning text NOT NULL, market_range_low numeric NOT NULL, market_range_median numeric NOT NULL,
  market_range_high numeric NOT NULL, current_ctc numeric NOT NULL, gap_analysis text NOT NULL,
  leverage_points jsonb NOT NULL DEFAULT '[]'::jsonb, sources_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.revenue_sessions TO service_role;
ALTER TABLE public.revenue_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX members_last_seen_idx ON public.members(last_seen DESC);
CREATE INDEX clarity_member_idx ON public.clarity_sessions(member_id, created_at DESC);
CREATE INDEX authority_member_idx ON public.authority_sessions(member_id, created_at DESC);
CREATE INDEX reach_member_idx ON public.reach_sessions(member_id, created_at DESC);
CREATE INDEX evidence_member_idx ON public.evidence_entries(member_id, created_at DESC);
CREATE INDEX energy_member_idx ON public.energy_sessions(member_id, created_at DESC);
CREATE INDEX rewrites_member_idx ON public.energy_rewrites(member_id, created_at DESC);
CREATE INDEX revenue_member_idx ON public.revenue_sessions(member_id, created_at DESC);