
-- Fix touch_updated_at search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Revoke execute on award_xp from public/authenticated (server-only via service role)
REVOKE ALL ON FUNCTION public.award_xp(UUID, INT, TEXT, INT) FROM PUBLIC, anon, authenticated;

-- Revoke handle_new_user too (only called by trigger)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- has_role is used by RLS policies — keep it callable by authenticated
-- (policy evaluation needs it; SECURITY DEFINER + stable + fixed search_path is safe)
