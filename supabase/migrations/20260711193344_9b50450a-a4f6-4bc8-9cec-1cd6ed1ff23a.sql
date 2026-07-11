
-- 1. Add telephone column to admins
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS telephone text;

-- 2. demandes_professeur
CREATE TABLE IF NOT EXISTS public.demandes_professeur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_complet text NOT NULL,
  email text NOT NULL,
  matiere text NOT NULL,
  etablissement_origine text,
  experience text,
  statut text NOT NULL DEFAULT 'nouveau',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demandes_professeur TO authenticated;
GRANT INSERT ON public.demandes_professeur TO anon;
GRANT ALL ON public.demandes_professeur TO service_role;
ALTER TABLE public.demandes_professeur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit prof application" ON public.demandes_professeur FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Super admins manage prof applications" ON public.demandes_professeur FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 3. cours_en_ligne
CREATE TABLE IF NOT EXISTS public.cours_en_ligne (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professeur_id uuid NOT NULL,
  titre text NOT NULL,
  description text,
  matiere text NOT NULL,
  niveau text,
  prix numeric NOT NULL DEFAULT 0,
  video_url text,
  statut text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cours_en_ligne TO authenticated;
GRANT SELECT ON public.cours_en_ligne TO anon;
GRANT ALL ON public.cours_en_ligne TO service_role;
ALTER TABLE public.cours_en_ligne ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses readable by all" ON public.cours_en_ligne FOR SELECT TO anon, authenticated USING (statut = 'publie' OR professeur_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Professors manage their courses" ON public.cours_en_ligne FOR ALL TO authenticated USING (professeur_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (professeur_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- 4. cours_achats
CREATE TABLE IF NOT EXISTS public.cours_achats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cours_id uuid NOT NULL REFERENCES public.cours_en_ligne(id) ON DELETE CASCADE,
  etudiant_id uuid NOT NULL,
  montant numeric NOT NULL DEFAULT 0,
  methode_paiement text,
  statut text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cours_achats TO authenticated;
GRANT ALL ON public.cours_achats TO service_role;
ALTER TABLE public.cours_achats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students see their purchases" ON public.cours_achats FOR SELECT TO authenticated USING (etudiant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.cours_en_ligne c WHERE c.id = cours_id AND c.professeur_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Students insert their purchases" ON public.cours_achats FOR INSERT TO authenticated WITH CHECK (etudiant_id = auth.uid());
CREATE POLICY "Super admin manages purchases" ON public.cours_achats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 5. parametres_plateforme
CREATE TABLE IF NOT EXISTS public.parametres_plateforme (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percentage numeric NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parametres_plateforme TO authenticated, anon;
GRANT ALL ON public.parametres_plateforme TO service_role;
ALTER TABLE public.parametres_plateforme ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read platform params" ON public.parametres_plateforme FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admin manages platform params" ON public.parametres_plateforme FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.parametres_plateforme (commission_percentage) SELECT 20 WHERE NOT EXISTS (SELECT 1 FROM public.parametres_plateforme);
