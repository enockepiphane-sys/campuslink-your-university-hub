/*
# Login flow improvements + Professor (online courses) feature

## 1. New functions for login flow
- `lookup_returning_user(_email, _date_naissance)` — finds users who already have a linked user_id (already verified once). Returns role + ids.
- `lookup_first_time_user(_email, _date_naissance, _etablissement_id, _filiere_id, _niveau_id)` — finds first-time users in liste_officielle (students) or admins (admin_etablissement) where user_id IS NULL.

## 2. Professor feature
- Add 'professeur' to app_role enum
- `demandes_professeur` table: candidatures from professors
- `cours_en_ligne` table: online courses uploaded by professors
- `cours_achats` table: student purchases
- `parametres_plateforme` table: platform settings (commission_percentage)
- RLS policies on all new tables
*/

-- =====================================================
-- 1. LOGIN FLOW FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.lookup_returning_user(_email text, _date_naissance date)
RETURNS TABLE(role text, etablissement_id uuid, filiere_id uuid, niveau_id uuid, nom_complet text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
(SELECT 'super_admin'::text, NULL::uuid, NULL::uuid, NULL::uuid, nom_complet
FROM super_admins
WHERE lower(trim(email)) = lower(trim(_email))
AND date_naissance = _date_naissance
AND user_id IS NOT NULL
LIMIT 1)
UNION ALL
(SELECT 'admin_etablissement'::text, etablissement_id, NULL::uuid, NULL::uuid, nom_complet
FROM admins
WHERE lower(trim(email)) = lower(trim(_email))
AND date_naissance = _date_naissance
AND statut = 'actif'
AND user_id IS NOT NULL
LIMIT 1)
UNION ALL
(SELECT 'etudiant'::text, etablissement_id, filiere_id, niveau_id, nom_complet
FROM etudiants
WHERE lower(trim(email)) = lower(trim(_email))
AND date_naissance = _date_naissance
AND user_id IS NOT NULL
LIMIT 1)
$function$;

CREATE OR REPLACE FUNCTION public.lookup_first_time_user(
  _email text,
  _date_naissance date,
  _etablissement_id uuid DEFAULT NULL,
  _filiere_id uuid DEFAULT NULL,
  _niveau_id uuid DEFAULT NULL
)
RETURNS TABLE(role text, etablissement_id uuid, filiere_id uuid, niveau_id uuid, nom_complet text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
(SELECT 'super_admin'::text, NULL::uuid, NULL::uuid, NULL::uuid, nom_complet
FROM super_admins
WHERE lower(trim(email)) = lower(trim(_email))
AND date_naissance = _date_naissance
AND user_id IS NULL
LIMIT 1)
UNION ALL
(SELECT 'admin_etablissement'::text, etablissement_id, NULL::uuid, NULL::uuid, nom_complet
FROM admins
WHERE lower(trim(email)) = lower(trim(_email))
AND date_naissance = _date_naissance
AND statut = 'actif'
AND user_id IS NULL
AND (_etablissement_id IS NULL OR etablissement_id = _etablissement_id)
LIMIT 1)
UNION ALL
(SELECT 'etudiant'::text, lo.etablissement_id, lo.filiere_id, lo.niveau_id, lo.nom_complet
FROM liste_officielle lo
WHERE lower(trim(lo.email)) = lower(trim(_email))
AND lo.date_naissance = _date_naissance
AND COALESCE(lo.utilise, false) = false
AND (_etablissement_id IS NULL OR lo.etablissement_id = _etablissement_id)
AND (_filiere_id IS NULL OR lo.filiere_id = _filiere_id)
AND (_niveau_id IS NULL OR lo.niveau_id = _niveau_id)
LIMIT 1)
$function$;

-- =====================================================
-- 2. PROFESSOR FEATURE
-- =====================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'professeur';

CREATE TABLE IF NOT EXISTS public.demandes_professeur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_complet text NOT NULL,
  email text NOT NULL,
  matiere text NOT NULL,
  etablissement_origine text,
  experience text,
  statut text NOT NULL DEFAULT 'nouveau',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.demandes_professeur ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_demandes_professeur" ON public.demandes_professeur;
CREATE POLICY "public_insert_demandes_professeur"
ON public.demandes_professeur FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_demandes_professeur" ON public.demandes_professeur;
CREATE POLICY "authenticated_read_demandes_professeur"
ON public.demandes_professeur FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_update_demandes_professeur" ON public.demandes_professeur;
CREATE POLICY "authenticated_update_demandes_professeur"
ON public.demandes_professeur FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.cours_en_ligne (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professeur_id uuid NOT NULL DEFAULT auth.uid(),
  titre text NOT NULL,
  description text,
  matiere text NOT NULL,
  niveau text,
  prix numeric(10, 2) NOT NULL DEFAULT 0,
  video_url text,
  statut text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cours_en_ligne ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prof_read_own_cours" ON public.cours_en_ligne;
CREATE POLICY "prof_read_own_cours"
ON public.cours_en_ligne FOR SELECT
TO authenticated USING (auth.uid() = professeur_id);

DROP POLICY IF EXISTS "admin_read_all_cours" ON public.cours_en_ligne;
CREATE POLICY "admin_read_all_cours"
ON public.cours_en_ligne FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

DROP POLICY IF EXISTS "prof_insert_own_cours" ON public.cours_en_ligne;
CREATE POLICY "prof_insert_own_cours"
ON public.cours_en_ligne FOR INSERT
TO authenticated WITH CHECK (auth.uid() = professeur_id);

DROP POLICY IF EXISTS "prof_update_own_cours" ON public.cours_en_ligne;
CREATE POLICY "prof_update_own_cours"
ON public.cours_en_ligne FOR UPDATE
TO authenticated USING (auth.uid() = professeur_id) WITH CHECK (auth.uid() = professeur_id);

DROP POLICY IF EXISTS "admin_update_cours" ON public.cours_en_ligne;
CREATE POLICY "admin_update_cours"
ON public.cours_en_ligne FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
) WITH CHECK (true);

DROP POLICY IF EXISTS "prof_delete_own_cours" ON public.cours_en_ligne;
CREATE POLICY "prof_delete_own_cours"
ON public.cours_en_ligne FOR DELETE
TO authenticated USING (auth.uid() = professeur_id);

CREATE TABLE IF NOT EXISTS public.cours_achats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cours_id uuid NOT NULL REFERENCES public.cours_en_ligne(id) ON DELETE CASCADE,
  etudiant_id uuid NOT NULL DEFAULT auth.uid(),
  montant numeric(10, 2) NOT NULL DEFAULT 0,
  methode_paiement text,
  statut text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cours_achats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_read_own_achats" ON public.cours_achats;
CREATE POLICY "student_read_own_achats"
ON public.cours_achats FOR SELECT
TO authenticated USING (auth.uid() = etudiant_id);

DROP POLICY IF EXISTS "student_insert_own_achats" ON public.cours_achats;
CREATE POLICY "student_insert_own_achats"
ON public.cours_achats FOR INSERT
TO authenticated WITH CHECK (auth.uid() = etudiant_id);

DROP POLICY IF EXISTS "prof_read_own_cours_achats" ON public.cours_achats;
CREATE POLICY "prof_read_own_cours_achats"
ON public.cours_achats FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.cours_en_ligne WHERE cours_en_ligne.id = cours_achats.cours_id AND cours_en_ligne.professeur_id = auth.uid())
);

DROP POLICY IF EXISTS "admin_read_all_achats" ON public.cours_achats;
CREATE POLICY "admin_read_all_achats"
ON public.cours_achats FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

CREATE TABLE IF NOT EXISTS public.parametres_plateforme (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percentage numeric(5, 2) NOT NULL DEFAULT 20.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.parametres_plateforme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_read_parametres" ON public.parametres_plateforme;
CREATE POLICY "authenticated_read_parametres"
ON public.parametres_plateforme FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_parametres" ON public.parametres_plateforme;
CREATE POLICY "admin_update_parametres"
ON public.parametres_plateforme FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

INSERT INTO public.parametres_plateforme (commission_percentage)
SELECT 20.00
WHERE NOT EXISTS (SELECT 1 FROM public.parametres_plateforme);

GRANT ALL ON public.demandes_professeur TO authenticated;
GRANT ALL ON public.cours_en_ligne TO authenticated;
GRANT ALL ON public.cours_achats TO authenticated;
GRANT ALL ON public.parametres_plateforme TO authenticated;
GRANT INSERT ON public.demandes_professeur TO anon;
