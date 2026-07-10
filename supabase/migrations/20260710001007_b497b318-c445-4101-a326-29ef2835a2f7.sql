
-- 1) etablissements: remove anon exposure of contact fields
DROP POLICY IF EXISTS "public read actifs" ON public.etablissements;
CREATE POLICY "authenticated read actifs" ON public.etablissements
  FOR SELECT TO authenticated
  USING (statut = 'actif'::etablissement_statut OR public.has_role(auth.uid(), 'super_admin'));
REVOKE SELECT ON public.etablissements FROM anon;

-- Public-safe view (no email / telephone) for anonymous listing needs
CREATE OR REPLACE VIEW public.etablissements_public
WITH (security_invoker = true) AS
SELECT id, nom, ville, pays, categorie, statut, logo_url, description
FROM public.etablissements
WHERE statut = 'actif'::etablissement_statut;
GRANT SELECT ON public.etablissements_public TO anon, authenticated;

-- 2) filieres: restrict to authenticated + active establishments
DROP POLICY IF EXISTS "read filieres" ON public.filieres;
CREATE POLICY "read filieres" ON public.filieres
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.etablissements e
    WHERE e.id = filieres.etablissement_id
      AND e.statut = 'actif'::etablissement_statut
  ) OR public.has_role(auth.uid(), 'super_admin'));
REVOKE SELECT ON public.filieres FROM anon;

-- 3) niveaux: same restriction
DROP POLICY IF EXISTS "read niveaux" ON public.niveaux;
CREATE POLICY "read niveaux" ON public.niveaux
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.etablissements e
    WHERE e.id = niveaux.etablissement_id
      AND e.statut = 'actif'::etablissement_statut
  ) OR public.has_role(auth.uid(), 'super_admin'));
REVOKE SELECT ON public.niveaux FROM anon;
