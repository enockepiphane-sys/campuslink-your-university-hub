-- Add function to verify student by email (used for OTP login flow)
CREATE OR REPLACE FUNCTION public.verify_student_by_email(
  _etablissement_id uuid,
  _filiere_id uuid,
  _niveau_id uuid,
  _nom_complet text,
  _email text,
  _date_naissance date
) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.liste_officielle
    WHERE etablissement_id = _etablissement_id
      AND filiere_id = _filiere_id
      AND niveau_id = _niveau_id
      AND lower(trim(nom_complet)) = lower(trim(_nom_complet))
      AND lower(trim(email)) = lower(trim(_email))
      AND date_naissance = _date_naissance
      AND utilise = false
  );
$$;

GRANT EXECUTE ON FUNCTION public.verify_student_by_email(uuid,uuid,uuid,text,text,date) TO anon, authenticated;

-- Insert test data: Université Test de Ouaga
INSERT INTO public.etablissements (nom, statut, email, telephone, adresse, description) VALUES
  ('UNIVERSITE TEST DE OUAGA', 'actif', 'contact@test-ouaga.bf', '+226 00 00 00 00', 'Ouagadougou', 'Établissement de test pour les démonstrations')
ON CONFLICT DO NOTHING;

-- Get the etablissement_id for test data
DO $$
DECLARE
  v_etab_id uuid;
  v_filiere_id uuid;
  v_niveau_id uuid;
BEGIN
  SELECT id INTO v_etab_id FROM public.etablissements WHERE nom = 'UNIVERSITE TEST DE OUAGA';
  
  IF v_etab_id IS NULL THEN
    RAISE NOTICE 'Test establishment not found';
    RETURN;
  END IF;
  
  -- Create filiere
  INSERT INTO public.filieres (etablissement_id, nom) VALUES (v_etab_id, 'Informatique')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_filiere_id;
  
  IF v_filiere_id IS NULL THEN
    SELECT id INTO v_filiere_id FROM public.filieres WHERE etablissement_id = v_etab_id AND nom = 'Informatique';
  END IF;
  
  -- Create niveau
  INSERT INTO public.niveaux (etablissement_id, nom, ordre) VALUES (v_etab_id, 'Licence 1', 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_niveau_id;
  
  IF v_niveau_id IS NULL THEN
    SELECT id INTO v_niveau_id FROM public.niveaux WHERE etablissement_id = v_etab_id AND nom = 'Licence 1';
  END IF;
  
  -- Create test student in liste_officielle
  INSERT INTO public.liste_officielle (
    etablissement_id,
    filiere_id,
    niveau_id,
    nom_complet,
    email,
    date_naissance,
    matricule,
    utilise
  ) VALUES (
    v_etab_id,
    v_filiere_id,
    v_niveau_id,
    'Wendyam SAOUADOGO',
    'wendyamsaouadogo@gmail.com',
    '2000-01-01',
    'M0001',
    false
  )
  ON CONFLICT DO NOTHING;
END $$;