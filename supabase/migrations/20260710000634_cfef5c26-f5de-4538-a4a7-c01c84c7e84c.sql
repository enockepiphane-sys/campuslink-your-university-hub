
ALTER TABLE public.niveaux ADD COLUMN IF NOT EXISTS filiere_id UUID REFERENCES public.filieres(id) ON DELETE CASCADE;
ALTER TABLE public.annonces ADD COLUMN IF NOT EXISTS filiere_id UUID REFERENCES public.filieres(id) ON DELETE CASCADE;
ALTER TABLE public.annonces ADD COLUMN IF NOT EXISTS niveau_id UUID REFERENCES public.niveaux(id) ON DELETE CASCADE;
