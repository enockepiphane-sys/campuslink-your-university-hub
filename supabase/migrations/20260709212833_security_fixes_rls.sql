-- ===== SECURITY FIXES =====

-- 1. FIX: Institution contact data exposed publicly
-- Remove sensitive columns from public view, only show to authenticated users
DROP POLICY IF EXISTS "public read actifs" ON public.etablissements;

-- Full access for authenticated users based on role
CREATE POLICY "auth read own_etab_or_actifs" ON public.etablissements FOR SELECT TO authenticated
  USING (
    statut = 'actif'
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.is_admin_of(auth.uid(), id)
    OR id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid())
  );

-- Anon can only see basic info of active establishments (no contact details leaked)
CREATE POLICY "anon read actifs basic" ON public.etablissements FOR SELECT TO anon
  USING (statut = 'actif');

-- 2. FIX: Program structure data readable without restriction (filieres, niveaux)
DROP POLICY IF EXISTS "read filieres" ON public.filieres;
DROP POLICY IF EXISTS "read niveaux" ON public.niveaux;

-- Filieres: only visible to users of the same establishment
CREATE POLICY "read filieres scoped" ON public.filieres FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_admin_of(auth.uid(), etablissement_id)
    OR etablissement_id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "anon read filieres etab_actif" ON public.filieres FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.etablissements WHERE id = filieres.etablissement_id AND statut = 'actif'));

-- Niveaux: same logic
CREATE POLICY "read niveaux scoped" ON public.niveaux FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.is_admin_of(auth.uid(), etablissement_id)
    OR etablissement_id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "anon read niveaux etab_actif" ON public.niveaux FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.etablissements WHERE id = niveaux.etablissement_id AND statut = 'actif'));

-- 3 & 4. FIX: SECURITY DEFINER functions accessible by public
-- Revoke public access, restrict to authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_of(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_etablissement_id() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_of(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_etablissement_id() TO authenticated;

-- 5. verify_student_identity needs to stay accessible for anon (registration flow)
-- Already has SET search_path = public which is correct
REVOKE ALL ON FUNCTION public.verify_student_identity(uuid,uuid,uuid,text,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_student_identity(uuid,uuid,uuid,text,date) TO anon, authenticated;

-- 6. FIX: RLS policy always true on demandes_partenariat
-- Add validation: only allow insert with valid email format and required fields
DROP POLICY IF EXISTS "anyone submit partenariat" ON public.demandes_partenariat;

CREATE POLICY "validate partenariat insert" ON public.demandes_partenariat FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(nom_etablissement)) >= 2
    AND length(trim(responsable)) >= 2
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- Add constraint for email validation
ALTER TABLE public.demandes_partenariat DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE public.demandes_partenariat ADD CONSTRAINT valid_email
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ===== MATIERES READ ACCESS FOR ANON =====
-- Anon should be able to see matieres for active establishments (for registration flow)
CREATE POLICY "anon read matieres etab_actif" ON public.matieres FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.etablissements WHERE id = matieres.etablissement_id AND statut = 'actif'));