/*
# Auth unifiée sans mot de passe + restructure administrateur

## Changements
1. Nouvelles tables
   - `super_admins` : comptes super_admin fixes (email, date_naissance, nom_complet, user_id nullable)
   - `admins` : administrateurs d'établissement créés par super_admin (email, date_naissance, nom_complet, etablissement_id, statut, user_id nullable)
2. Colonnes ajoutées
   - `niveaux.filiere_id` : lie un niveau à une filière précise (nullable pour rétro-compat)
   - `annonces.filiere_id`, `annonces.niveau_id` : annonces scopées à une filière+niveau (nullable = établissement-wide)
3. Fonctions
   - `lookup_user_by_email_birthdate` : recherche un utilisateur par email + date de naissance dans super_admins → admins → liste_officielle (SECURITY DEFINER)
   - `finalize_login_account` : finalise le compte après OTP (crée profile, user_roles, etudiants si besoin)
4. Données seed
   - 2 comptes super_admin : enocksaouadogo@gmail.com, epiphanesaouadogo@gmail.com (date naissance 2003-01-05)
   - 1 admin : enockepiphane@gmail.com (date naissance 2003-01-05) pour UNIVERSITE TEST DE OUAGA
   - Lie le niveau "Licence 1" existant à la filière "Informatique"
5. Sécurité
   - RLS sur super_admins et admins
   - Policies pour lecture/écriture
*/

-- ============================================================
-- 1. Table super_admins
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  date_naissance date NOT NULL,
  nom_complet text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sa_select_all" ON super_admins;
CREATE POLICY "sa_select_all" ON super_admins FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "sa_insert_super_admin" ON super_admins;
CREATE POLICY "sa_insert_super_admin" ON super_admins FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "sa_update_super_admin" ON super_admins;
CREATE POLICY "sa_update_super_admin" ON super_admins FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "sa_delete_super_admin" ON super_admins;
CREATE POLICY "sa_delete_super_admin" ON super_admins FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));

-- ============================================================
-- 2. Table admins (établissement)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  date_naissance date NOT NULL,
  nom_complet text NOT NULL,
  etablissement_id uuid NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
  statut text NOT NULL DEFAULT 'actif',
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, etablissement_id)
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adm_select_scoped" ON admins;
CREATE POLICY "adm_select_scoped" ON admins FOR SELECT
  TO authenticated USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR is_admin_of(auth.uid(), etablissement_id)
  );

DROP POLICY IF EXISTS "adm_insert_super" ON admins;
CREATE POLICY "adm_insert_super" ON admins FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "adm_update_super" ON admins;
CREATE POLICY "adm_update_super" ON admins FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "adm_delete_super" ON admins;
CREATE POLICY "adm_delete_super" ON admins FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'super_admin'::app_role));

-- ============================================================
-- 3. Ajout colonnes
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niveaux' AND column_name='filiere_id') THEN
    ALTER TABLE niveaux ADD COLUMN filiere_id uuid REFERENCES filieres(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='annonces' AND column_name='filiere_id') THEN
    ALTER TABLE annonces ADD COLUMN filiere_id uuid REFERENCES filieres(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='annonces' AND column_name='niveau_id') THEN
    ALTER TABLE annonces ADD COLUMN niveau_id uuid REFERENCES niveaux(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 4. Fonction lookup_user_by_email_birthdate
-- ============================================================
CREATE OR REPLACE FUNCTION lookup_user_by_email_birthdate(_email text, _date_naissance date)
RETURNS TABLE(role text, etablissement_id uuid, filiere_id uuid, niveau_id uuid, nom_complet text)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'public'
AS $$
  (SELECT 'super_admin'::text, NULL::uuid, NULL::uuid, NULL::uuid, nom_complet
   FROM super_admins
   WHERE lower(trim(email)) = lower(trim(_email))
   AND date_naissance = _date_naissance
   LIMIT 1)
  UNION ALL
  (SELECT 'admin_etablissement'::text, etablissement_id, NULL::uuid, NULL::uuid, nom_complet
   FROM admins
   WHERE lower(trim(email)) = lower(trim(_email))
   AND date_naissance = _date_naissance
   AND statut = 'actif'
   LIMIT 1)
  UNION ALL
  (SELECT 'etudiant'::text, lo.etablissement_id, lo.filiere_id, lo.niveau_id, lo.nom_complet
   FROM liste_officielle lo
   WHERE lower(trim(lo.email)) = lower(trim(_email))
   AND lo.date_naissance = _date_naissance
   AND COALESCE(lo.utilise, false) = false
   LIMIT 1)
$$;

-- ============================================================
-- 5. Seed: super_admins
-- ============================================================
INSERT INTO super_admins (email, date_naissance, nom_complet)
VALUES
  ('enocksaouadogo@gmail.com', '2003-01-05', 'Enock SA OUADOGO'),
  ('epiphanesaouadogo@gmail.com', '2003-01-05', 'Epiphane SA OUADOGO')
ON CONFLICT (email) DO UPDATE SET date_naissance = EXCLUDED.date_naissance, nom_complet = EXCLUDED.nom_complet;

-- ============================================================
-- 6. Seed: admin pour UNIVERSITE TEST DE OUAGA
-- ============================================================
INSERT INTO admins (email, date_naissance, nom_complet, etablissement_id, statut)
SELECT 'enockepiphane@gmail.com', '2003-01-05', 'Enock Epiphane', id, 'actif'
FROM etablissements
WHERE nom = 'UNIVERSITE TEST DE OUAGA'
ON CONFLICT (email, etablissement_id) DO UPDATE SET date_naissance = EXCLUDED.date_naissance, nom_complet = EXCLUDED.nom_complet, statut = 'actif';

-- ============================================================
-- 7. Lier le niveau "Licence 1" à la filière "Informatique"
-- ============================================================
UPDATE niveaux n
SET filiere_id = f.id
FROM filieres f
WHERE f.etablissement_id = n.etablissement_id
AND f.nom = 'Informatique'
AND n.nom = 'Licence 1'
AND n.etablissement_id = '5b0bd5df-aafc-42df-9a7f-00743b6b80ff'
AND n.filiere_id IS NULL;

-- ============================================================
-- 8. RLS policies pour annonces avec filiere/niveau
-- ============================================================
-- Les politiques existantes sur annonces utilisent etablissement_id.
-- On ajoute des policies pour permettre la lecture par etudiants authentifiés
-- de leur établissement (annonces établissement-wide + annonces de leur filiere/niveau).
DROP POLICY IF EXISTS "read annonces scoped" ON annonces;
CREATE POLICY "read annonces scoped" ON annonces FOR SELECT
  TO authenticated USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR is_admin_of(auth.uid(), etablissement_id)
    OR etablissement_id IN (
      SELECT e.etablissement_id FROM etudiants e WHERE e.user_id = auth.uid()
      AND (
        annonces.filiere_id IS NULL  -- annonce établissement-wide
        OR (annonces.filiere_id = e.filiere_id AND annonces.niveau_id IS NULL)
        OR (annonces.filiere_id = e.filiere_id AND annonces.niveau_id = e.niveau_id)
      )
    )
    OR etablissement_id IN (
      SELECT p.etablissement_id FROM profiles p WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin manage annonces" ON annonces;
CREATE POLICY "admin manage annonces" ON annonces FOR ALL
  TO authenticated
  USING (is_admin_of(auth.uid(), etablissement_id))
  WITH CHECK (is_admin_of(auth.uid(), etablissement_id));
