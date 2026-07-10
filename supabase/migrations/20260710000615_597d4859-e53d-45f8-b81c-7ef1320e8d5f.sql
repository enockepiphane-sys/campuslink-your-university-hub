
-- Tables super_admins et admins d'établissement
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  nom_complet TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.super_admins TO authenticated;
GRANT ALL ON public.super_admins TO service_role;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super_admins self read" ON public.super_admins FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  etablissement_id UUID NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom_complet TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, etablissement_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage admins" ON public.admins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "admins self read" ON public.admins FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RPC lookup unifié
CREATE OR REPLACE FUNCTION public.lookup_user_by_email_birthdate(
  _email TEXT,
  _date_naissance DATE
)
RETURNS TABLE (
  role TEXT,
  etablissement_id UUID,
  filiere_id UUID,
  niveau_id UUID,
  nom_complet TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. super_admin
  RETURN QUERY
  SELECT 'super_admin'::TEXT, NULL::UUID, NULL::UUID, NULL::UUID, sa.nom_complet
  FROM public.super_admins sa
  WHERE lower(trim(sa.email)) = lower(trim(_email))
    AND sa.date_naissance = _date_naissance
  LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  -- 2. admin_etablissement
  RETURN QUERY
  SELECT 'admin_etablissement'::TEXT, a.etablissement_id, NULL::UUID, NULL::UUID, a.nom_complet
  FROM public.admins a
  WHERE lower(trim(a.email)) = lower(trim(_email))
    AND a.date_naissance = _date_naissance
    AND a.statut = 'actif'
  LIMIT 1;
  IF FOUND THEN RETURN; END IF;

  -- 3. étudiant (liste officielle)
  RETURN QUERY
  SELECT 'etudiant'::TEXT, l.etablissement_id, l.filiere_id, l.niveau_id, l.nom_complet
  FROM public.liste_officielle l
  WHERE lower(trim(l.email)) = lower(trim(_email))
    AND l.date_naissance = _date_naissance
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_user_by_email_birthdate(TEXT, DATE) TO anon, authenticated, service_role;
