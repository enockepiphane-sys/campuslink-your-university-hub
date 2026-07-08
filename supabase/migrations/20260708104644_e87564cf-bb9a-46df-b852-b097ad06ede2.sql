
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_etablissement', 'etudiant');
CREATE TYPE public.etablissement_statut AS ENUM ('actif', 'suspendu', 'en_attente');

-- ===== ETABLISSEMENTS =====
CREATE TABLE public.etablissements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  logo_url text,
  adresse text,
  email text,
  telephone text,
  description text,
  statut public.etablissement_statut NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.etablissements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etablissements TO authenticated;
GRANT ALL ON public.etablissements TO service_role;
ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;

-- ===== USER ROLES =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  etablissement_id uuid REFERENCES public.etablissements(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, etablissement_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of(_user_id uuid, _etablissement_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND etablissement_id = _etablissement_id
      AND role = 'admin_etablissement'
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_etablissement_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT etablissement_id FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin_etablissement'
  LIMIT 1;
$$;

-- Policies etablissements
CREATE POLICY "public read actifs" ON public.etablissements FOR SELECT TO anon, authenticated
  USING (statut = 'actif' OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin manage" ON public.etablissements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Policies user_roles
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_complet text,
  email text,
  etablissement_id uuid REFERENCES public.etablissements(id) ON DELETE SET NULL,
  avatar_url text,
  date_naissance date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or same etab admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid()
    OR public.has_role(auth.uid(), 'super_admin')
    OR (etablissement_id IS NOT NULL AND public.is_admin_of(auth.uid(), etablissement_id)));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Trigger auto-création profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nom_complet, email)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'nom_complet', ''), new.email);
  RETURN new;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== FILIERES / NIVEAUX =====
CREATE TABLE public.filieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  nom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.filieres TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.filieres TO authenticated;
GRANT ALL ON public.filieres TO service_role;
ALTER TABLE public.filieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read filieres" ON public.filieres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage filieres" ON public.filieres FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));

CREATE TABLE public.niveaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  nom text NOT NULL,
  ordre int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.niveaux TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.niveaux TO authenticated;
GRANT ALL ON public.niveaux TO service_role;
ALTER TABLE public.niveaux ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read niveaux" ON public.niveaux FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage niveaux" ON public.niveaux FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));

-- ===== MATIERES =====
CREATE TABLE public.matieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  filiere_id uuid REFERENCES public.filieres(id) ON DELETE SET NULL,
  niveau_id uuid REFERENCES public.niveaux(id) ON DELETE SET NULL,
  nom text NOT NULL,
  code text,
  credit int DEFAULT 0,
  semestre text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matieres TO authenticated;
GRANT ALL ON public.matieres TO service_role;
ALTER TABLE public.matieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage matieres" ON public.matieres FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));
CREATE POLICY "etudiant read own etab matieres" ON public.matieres FOR SELECT TO authenticated
  USING (etablissement_id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid()));

-- ===== ETUDIANTS =====
CREATE TABLE public.etudiants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  filiere_id uuid REFERENCES public.filieres(id) ON DELETE SET NULL,
  niveau_id uuid REFERENCES public.niveaux(id) ON DELETE SET NULL,
  matricule text,
  nom_complet text NOT NULL,
  email text,
  date_naissance date,
  statut text DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etudiants TO authenticated;
GRANT ALL ON public.etudiants TO service_role;
ALTER TABLE public.etudiants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage etudiants" ON public.etudiants FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));
CREATE POLICY "etudiant read self" ON public.etudiants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ===== LISTE OFFICIELLE (import admin, sert à la vérification) =====
CREATE TABLE public.liste_officielle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  nom_complet text NOT NULL,
  date_naissance date,
  matricule text,
  email text,
  filiere_id uuid REFERENCES public.filieres(id) ON DELETE SET NULL,
  niveau_id uuid REFERENCES public.niveaux(id) ON DELETE SET NULL,
  utilise boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.liste_officielle TO authenticated;
GRANT ALL ON public.liste_officielle TO service_role;
ALTER TABLE public.liste_officielle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage liste" ON public.liste_officielle FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));

-- Fonction publique pour vérifier l'identité d'un futur étudiant sans exposer la liste
CREATE OR REPLACE FUNCTION public.verify_student_identity(
  _etablissement_id uuid, _filiere_id uuid, _niveau_id uuid,
  _nom_complet text, _date_naissance date
) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.liste_officielle
    WHERE etablissement_id = _etablissement_id
      AND filiere_id = _filiere_id
      AND niveau_id = _niveau_id
      AND lower(trim(nom_complet)) = lower(trim(_nom_complet))
      AND date_naissance = _date_naissance
      AND utilise = false
  );
$$;
GRANT EXECUTE ON FUNCTION public.verify_student_identity(uuid,uuid,uuid,text,date) TO anon, authenticated;

-- ===== NOTES =====
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid NOT NULL REFERENCES public.etudiants(id) ON DELETE CASCADE,
  matiere_id uuid NOT NULL REFERENCES public.matieres(id) ON DELETE CASCADE,
  note numeric(5,2),
  published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage notes" ON public.notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND public.is_admin_of(auth.uid(), e.etablissement_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND public.is_admin_of(auth.uid(), e.etablissement_id)));
CREATE POLICY "etudiant read own published notes" ON public.notes FOR SELECT TO authenticated
  USING (published = true AND EXISTS (SELECT 1 FROM public.etudiants e WHERE e.id = etudiant_id AND e.user_id = auth.uid()));

-- ===== ANNONCES =====
CREATE TABLE public.annonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  titre text NOT NULL,
  contenu text NOT NULL,
  tag text,
  urgent boolean DEFAULT false,
  auteur text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.annonces TO authenticated;
GRANT ALL ON public.annonces TO service_role;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage annonces" ON public.annonces FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));
CREATE POLICY "etudiant read etab annonces" ON public.annonces FOR SELECT TO authenticated
  USING (etablissement_id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid()));

-- ===== EVENEMENTS =====
CREATE TABLE public.evenements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  date_evt timestamptz,
  lieu text,
  image_url text,
  categorie text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evenements TO authenticated;
GRANT ALL ON public.evenements TO service_role;
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage evenements" ON public.evenements FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));
CREATE POLICY "etudiant read etab evenements" ON public.evenements FOR SELECT TO authenticated
  USING (etablissement_id IN (SELECT etablissement_id FROM public.profiles WHERE id = auth.uid()));

-- ===== EMPLOIS DU TEMPS =====
CREATE TABLE public.emplois_du_temps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id uuid NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  filiere_id uuid REFERENCES public.filieres(id) ON DELETE CASCADE,
  niveau_id uuid REFERENCES public.niveaux(id) ON DELETE CASCADE,
  matiere text NOT NULL,
  jour text NOT NULL,
  heure_debut text,
  heure_fin text,
  salle text,
  enseignant text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emplois_du_temps TO authenticated;
GRANT ALL ON public.emplois_du_temps TO service_role;
ALTER TABLE public.emplois_du_temps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage edt" ON public.emplois_du_temps FOR ALL TO authenticated
  USING (public.is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (public.is_admin_of(auth.uid(), etablissement_id));
CREATE POLICY "etudiant read edt own" ON public.emplois_du_temps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.etudiants e
    WHERE e.user_id = auth.uid()
      AND e.etablissement_id = emplois_du_temps.etablissement_id
      AND (emplois_du_temps.filiere_id IS NULL OR e.filiere_id = emplois_du_temps.filiere_id)
      AND (emplois_du_temps.niveau_id IS NULL OR e.niveau_id = emplois_du_temps.niveau_id)));

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre text NOT NULL,
  message text,
  type text,
  lu boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user manage own notifs" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ===== DEMANDES PARTENARIAT =====
CREATE TABLE public.demandes_partenariat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_etablissement text NOT NULL,
  responsable text NOT NULL,
  email text NOT NULL,
  telephone text,
  message text,
  statut text DEFAULT 'nouveau',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.demandes_partenariat TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.demandes_partenariat TO authenticated;
GRANT ALL ON public.demandes_partenariat TO service_role;
ALTER TABLE public.demandes_partenariat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submit partenariat" ON public.demandes_partenariat FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "super_admin read partenariat" ON public.demandes_partenariat FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "super_admin update partenariat" ON public.demandes_partenariat FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ===== ACTIVITY LOGS =====
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  etablissement_id uuid REFERENCES public.etablissements(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "super_admin read all logs" ON public.activity_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')
    OR (etablissement_id IS NOT NULL AND public.is_admin_of(auth.uid(), etablissement_id)));

-- Update triggers
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER etablissements_touch BEFORE UPDATE ON public.etablissements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER notes_touch BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
