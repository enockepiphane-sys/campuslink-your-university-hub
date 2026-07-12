-- ===== RLS POLICIES CLEANUP FOR ETABLISSEMENTS =====
-- Purpose: Fix the issue where anonymous users couldn't see active institutions
--          in the registration form dropdown.
--
-- Problem: Two conflicting policies on etablissements table were preventing
--          proper anon access. The old "public read actifs" policy was too complex
--          and conflicted with the new simplified policy.
--
-- Solution: Drop the old conflicting policy and ensure the new one works correctly.

-- 1. Drop the old conflicting policy
DROP POLICY IF EXISTS "public read actifs" ON public.etablissements;

-- 2. Verify the new simplified policy exists for anon users
-- (This was created in migration 20260712014743, but we ensure it's here)
DROP POLICY IF EXISTS "anon read etablissements actifs" ON public.etablissements;

CREATE POLICY "anon read etablissements actifs"
  ON public.etablissements FOR SELECT
  TO anon
  USING (statut = 'actif');

-- 3. Keep the policy for authenticated super_admin to manage all
DROP POLICY IF EXISTS "super_admin manage" ON public.etablissements;

CREATE POLICY "super_admin manage etablissements"
  ON public.etablissements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 4. Ensure filieres policy allows anon reads
DROP POLICY IF EXISTS "read filieres" ON public.filieres;

CREATE POLICY "read filieres"
  ON public.filieres FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Ensure niveaux policy allows anon reads
DROP POLICY IF EXISTS "read niveaux" ON public.niveaux;

CREATE POLICY "read niveaux"
  ON public.niveaux FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6. Verify permissions are granted
GRANT SELECT ON public.etablissements TO anon;
GRANT SELECT ON public.filieres TO anon;
GRANT SELECT ON public.niveaux TO anon;
