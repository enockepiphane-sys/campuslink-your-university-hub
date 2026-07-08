# Plan — Transformation CampusLink en plateforme MVP multi-établissements

## Vision
Transformer le prototype (données fictives, choix public Étudiant/Admin) en une vraie plateforme SaaS multi-tenant à 3 rôles (super_admin, admin_etablissement, etudiant), avec backend Lovable Cloud, en **conservant intégralement le design actuel** (couleurs, cartes, layouts, KenteBar, typographies, navigation).

## Étape 1 — Activation Lovable Cloud
- Activer Lovable Cloud (Supabase managé) pour la base de données, l'auth et le stockage.
- Configurer l'auth email/password (une seule entrée "Se connecter" — plus de choix public de rôle).

## Étape 2 — Schéma base de données (migration)
Tables (toutes avec RLS + GRANTs + isolation par `etablissement_id`) :
- `etablissements` (id, nom, logo_url, adresse, email, telephone, description, statut)
- `user_roles` (id, user_id, role: super_admin|admin_etablissement|etudiant, etablissement_id) — table séparée obligatoire, fonction `has_role()` SECURITY DEFINER
- `profiles` (id=user_id, nom_complet, email, etablissement_id, date_naissance, avatar_url)
- `filieres` (id, etablissement_id, nom)
- `niveaux` (id, etablissement_id, nom)
- `annees_universitaires` (id, etablissement_id, libelle, active, archived)
- `semestres` (id, annee_id, libelle)
- `matieres` (id, etablissement_id, filiere_id, niveau_id, nom, code, credit, semestre_id)
- `etudiants` (id, user_id, etablissement_id, filiere_id, niveau_id, matricule nullable)
- `liste_officielle` (id, etablissement_id, nom_complet, date_naissance, filiere_id, niveau_id, matricule, email, verified bool) — importée par admin, utilisée pour vérification d'identité
- `notes` (id, etudiant_id, matiere_id, note, published)
- `annonces` (id, etablissement_id, titre, contenu, tag, urgent, auteur)
- `evenements` (id, etablissement_id, titre, description, date, lieu, image_url)
- `emplois_du_temps` (id, etablissement_id, niveau_id, filiere_id, matiere, jour, heure_debut, heure_fin, salle)
- `notifications` (id, user_id, message, type, lu)
- `demandes_partenariat` (id, nom_etablissement, responsable, email, telephone, message, statut)
- `activity_logs` (id, user_id, etablissement_id, action, details)

Trigger `handle_new_user()` pour créer le profil à l'inscription.

## Étape 3 — Auth unifiée
- Page `/login` : un seul formulaire (email + mot de passe). Après login, redirection selon rôle :
  - super_admin → `/admin/platform`
  - admin_etablissement → `/admin` (scope à son établissement)
  - etudiant → `/app`
- Layout `_authenticated` (géré par l'intégration).
- Suppression des liens de démonstration croisés (« Voir back-office », « Voir app étudiant ») → conditionnels selon rôle.

## Étape 4 — Parcours inscription étudiant (public)
Nouveau flow multi-étapes `/inscription` :
1. Sélection établissement (dropdown alimenté depuis `etablissements` actifs)
2. Filière + niveau (dropdowns liés à l'établissement)
3. Nom complet + email Gmail → Continuer
4. Date de naissance → « Vérifier mon identité » (compare avec `liste_officielle`)
5. Si trouvé : envoi code par email (Supabase OTP), page « Entrez le code »
6. Confirmation → création compte + rôle `etudiant` + lien `etablissements`

## Étape 5 — Espace Super Administrateur (`/platform`)
Nouveau layout + pages :
- Dashboard (stats globales : nb établissements, étudiants, admins)
- Gestion établissements (CRUD + logo upload + statut)
- Création comptes admins établissement
- Demandes de partenariat entrantes
- Journal d'activités

## Étape 6 — Refonte fonctionnelle Admin établissement
Conserver toutes les pages actuelles, remplacer les données statiques par des requêtes Supabase scopées `etablissement_id` :
- Étudiants : CRUD + import CSV/XLSX réel (parse + rapport doublons/erreurs) + upload dans `liste_officielle`
- Filières / Niveaux / Matières / Semestres / Années : nouvelles pages CRUD
- Annonces : CRUD réel
- Événements : CRUD réel (+ upload image)
- Notes : grille d'édition connectée
- Emploi du temps : nouvelle page CRUD
- Notifications sortantes
- Paramètres établissement (logo, infos)

## Étape 7 — Refonte fonctionnelle Espace étudiant
Conserver le design mobile actuel, brancher sur données réelles :
- Home / Profil / Notes / Annonces / Événements — vide si aucune donnée avec les messages exacts demandés (« Aucune note disponible. » etc.)
- Nouvelles pages : Emploi du temps, Notifications, Paramètres

## Étape 8 — Page vitrine publique
Refonte `/` : présentation CampusLink, fonctionnement, avantages universités, formulaire de demande de partenariat → `demandes_partenariat`.

## Étape 9 — Sécurité & polish
- RLS strict : isolation par établissement sur toutes les tables tenant
- Fonctions SECURITY DEFINER pour les checks de rôle
- Reset password, changement mot de passe, déconnexion propre
- Responsive vérifié (mobile/tablette/desktop)
- Suppression complète du fichier `src/lib/campus-data.ts` (mock)

## Notes techniques
- Stack : TanStack Start + Lovable Cloud (Supabase) + TanStack Query pour le fetching
- Design tokens (`src/styles.css`), composants `campus/ui.tsx`, KenteBar : **conservés à l'identique**
- Aucune donnée fictive persistée. Un compte super_admin seed sera créé via migration pour bootstrap.

## Livrable de cette itération
Vu l'ampleur, je propose de livrer par vagues :
- **Vague A (cette session)** : Cloud + schéma DB + auth unifiée + redirection par rôle + espace super admin (établissements + admins) + branchement des pages admin existantes (étudiants, annonces, événements, notes) sur les données réelles + espace étudiant vidé/branché + parcours inscription complet + page vitrine.
- **Vague B (session suivante, si besoin)** : filières/niveaux/matières/semestres/années CRUD complet, emploi du temps, notifications, journal d'activités, demandes de partenariat, import Excel avancé, upload logos/images.

Confirme si tu veux que je démarre la Vague A telle quelle, ou si tu veux ajuster le périmètre.
