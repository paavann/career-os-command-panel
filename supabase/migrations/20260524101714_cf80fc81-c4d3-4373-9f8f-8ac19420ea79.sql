
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, integer, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
