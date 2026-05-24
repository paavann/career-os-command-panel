-- 1. Restrict profile updates: prevent users from writing to gamification columns
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name, avatar_url, headline) ON public.profiles TO authenticated;

CREATE POLICY "Users update own profile safe columns"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Defense in depth: trigger that blocks gamification column writes from non-definer contexts
CREATE OR REPLACE FUNCTION public.prevent_profile_gamification_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.xp IS DISTINCT FROM OLD.xp
       OR NEW.level IS DISTINCT FROM OLD.level
       OR NEW.coins IS DISTINCT FROM OLD.coins
       OR NEW.streak_days IS DISTINCT FROM OLD.streak_days
       OR NEW.cpi_score IS DISTINCT FROM OLD.cpi_score
       OR NEW.tier IS DISTINCT FROM OLD.tier
       OR NEW.last_active_date IS DISTINCT FROM OLD.last_active_date THEN
      RAISE EXCEPTION 'Gamification fields can only be updated by the server';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_gamification_writes ON public.profiles;
CREATE TRIGGER prevent_profile_gamification_writes
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_gamification_writes();

-- 2. Lock down SECURITY DEFINER functions that should not be callable via the API
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, integer, text, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
-- has_role must remain EXECUTE-able as it is referenced by RLS policies.