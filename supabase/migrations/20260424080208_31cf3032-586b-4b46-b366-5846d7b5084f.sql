
CREATE OR REPLACE FUNCTION public.promote_to_admin(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_to_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(uuid) TO authenticated;
