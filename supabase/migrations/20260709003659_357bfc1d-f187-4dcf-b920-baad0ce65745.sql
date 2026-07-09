
-- 1. Ajout d'un type catégorie et de nouvelles colonnes
DO $$ BEGIN
  CREATE TYPE public.etablissement_categorie AS ENUM ('publique', 'privee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.etablissements
  ADD COLUMN IF NOT EXISTS categorie public.etablissement_categorie,
  ADD COLUMN IF NOT EXISTS ville text,
  ADD COLUMN IF NOT EXISTS pays text NOT NULL DEFAULT 'Burkina Faso';

-- 2. Seed idempotent (n'insère que si le nom n'existe pas déjà)
INSERT INTO public.etablissements (nom, categorie, ville, statut) VALUES
  -- Universités publiques
  ('Université Joseph Ki-Zerbo', 'publique', 'Ouagadougou', 'actif'),
  ('Université Thomas Sankara', 'publique', 'Ouagadougou', 'actif'),
  ('Université Nazi Boni', 'publique', 'Bobo-Dioulasso', 'actif'),
  ('Université Norbert Zongo', 'publique', 'Koudougou', 'actif'),
  ('Université de Dédougou', 'publique', 'Dédougou', 'actif'),
  ('Centre Universitaire de Ouahigouya', 'publique', 'Ouahigouya', 'actif'),
  ('Centre Universitaire de Fada N''Gourma', 'publique', 'Fada N''Gourma', 'actif'),
  ('Centre Universitaire de Tenkodogo', 'publique', 'Tenkodogo', 'actif'),
  ('Centre Universitaire de Gaoua', 'publique', 'Gaoua', 'actif'),
  ('Centre Universitaire de Manga', 'publique', 'Manga', 'actif'),
  -- Universités et écoles privées
  ('Université Saint Thomas d''Aquin (USTA)', 'privee', 'Ouagadougou', 'actif'),
  ('Université Aube Nouvelle', 'privee', 'Ouagadougou', 'actif'),
  ('Institut Supérieur des Technologies de l''Information et de la Communication (ISTIC)', 'privee', 'Ouagadougou', 'actif'),
  ('Institut International d''Ingénierie de l''Eau et de l''Environnement (2iE)', 'privee', 'Ouagadougou', 'actif')
ON CONFLICT DO NOTHING;

-- Éviter les doublons par nom si on relance
CREATE UNIQUE INDEX IF NOT EXISTS etablissements_nom_unique ON public.etablissements (lower(nom));
