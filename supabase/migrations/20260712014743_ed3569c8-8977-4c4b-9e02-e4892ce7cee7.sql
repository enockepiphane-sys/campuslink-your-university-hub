-- 1. Permettre la lecture publique (anon) des établissements actifs, filières et niveaux
--    pour que le formulaire d'inscription étudiante puisse peupler ses menus déroulants.
CREATE POLICY "anon read etablissements actifs"
  ON public.etablissements FOR SELECT
  TO anon
  USING (statut = 'actif');

CREATE POLICY "anon read filieres"
  ON public.filieres FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon read niveaux"
  ON public.niveaux FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.etablissements TO anon;
GRANT SELECT ON public.filieres TO anon;
GRANT SELECT ON public.niveaux TO anon;

-- 2. RPC pour vérifier si un email est déjà enregistré et sous quel rôle.
--    Retourne 'super_admin' | 'admin_etablissement' | 'etudiant' | NULL.
CREATE OR REPLACE FUNCTION public.email_role(_email text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _e text := lower(trim(_email));
BEGIN
  IF EXISTS (SELECT 1 FROM public.super_admins WHERE lower(trim(email)) = _e) THEN
    RETURN 'super_admin';
  END IF;
  IF EXISTS (SELECT 1 FROM public.admins WHERE lower(trim(email)) = _e) THEN
    RETURN 'admin_etablissement';
  END IF;
  IF EXISTS (SELECT 1 FROM public.etudiants WHERE lower(trim(email)) = _e) THEN
    RETURN 'etudiant';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(trim(email)) = _e) THEN
    RETURN 'etudiant';
  END IF;
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.email_role(text) TO anon, authenticated;