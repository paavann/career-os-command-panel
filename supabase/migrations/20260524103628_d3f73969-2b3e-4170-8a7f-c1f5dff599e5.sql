CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_first_user BOOLEAN;
  is_designated_admin BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Operator')
  );
  INSERT INTO public.career_scores (user_id) VALUES (NEW.id);

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO is_first_user;
  is_designated_admin := lower(NEW.email) = 'deeparajan890@gmail.com';

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  IF is_first_user OR is_designated_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  INSERT INTO public.user_missions (user_id, mission_id)
    SELECT NEW.id, id FROM public.missions WHERE active = true AND category = 'daily';
  RETURN NEW;
END;
$function$;

-- Backfill: if the designated admin already exists, grant the role now.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u
WHERE lower(u.email) = 'deeparajan890@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;