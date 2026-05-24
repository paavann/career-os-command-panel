CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Operator')
  );
  INSERT INTO public.career_scores (user_id) VALUES (NEW.id);

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO is_first_user;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  IF is_first_user THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  INSERT INTO public.user_missions (user_id, mission_id)
    SELECT NEW.id, id FROM public.missions WHERE active = true AND category = 'daily';
  RETURN NEW;
END;
$function$;