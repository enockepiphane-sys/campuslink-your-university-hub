import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { finalizeStudentSignup } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Inscription étudiant — CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Ref = { id: string; nom: string };

function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  // Steps: 1=establishment, 2=filière/niveau, 3=identity, 4=email, 5=check_email, 6=password, 7=success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [filieres, setFilieres] = useState<Ref[]>([]);
  const [niveaux, setNiveaux] = useState<Ref[]>([]);

  const [etablissement_id, setEtab] = useState("");
  const [filiere_id, setFiliere] = useState("");
  const [niveau_id, setNiveau] = useState("");
  const [nom_complet, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [date_naissance, setDate] = useState("");

  useEffect(() => {
    supabase
      .from("etablissements")
      .select("id,nom")
      .eq("statut", "Actif")
      .order("nom")
      .then(({ data }) => setEtabs(data ?? []));
  }, []);

  useEffect(() => {
    if (!etablissement_id) return;
    supabase
      .from("filieres")
      .select("id,nom")
      .eq("etablissement_id", etablissement_id)
      .order("nom")
      .then(({ data }) => setFilieres(data ?? []));
    supabase
      .from("niveaux")
      .select("id,nom")
      .eq("etablissement_id", etablissement_id)
      .order("ordre")
      .then(({ data }) => setNiveaux(data ?? []));
  }, [etablissement_id]);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) navigate({ to: roleHomePath(auth.role) });
  }, [auth, navigate]);

  async function verifierIdentite() {
    setBusy(true);
    setError("");
    const { data, error } = await supabase.rpc("verify_student_identity", {
      _etablissement_id: etablissement_id,
      _filiere_id: filiere_id,
      _niveau_id: niveau_id,
      _nom_complet: nom_complet,
      _date_naissance: date_naissance,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data) {
      setError("Informations introuvables dans la liste officielle de votre établissement.");
      return;
    }
    // ✅ Identity verified, move to email step
    setStep(4);
  }

  async function envoyerConfirmationEmail() {
    setBusy(true);
    setError("");

    // Check if email already exists
    const { data: existingRole } = await supabase.rpc("email_role", { _email: email });
    if (existingRole) {
      setError("Cet email est déjà inscrit. Veuillez vous connecter.");
      setBusy(false);
      return;
    }

    // Send confirmation link with temporary password
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: "temp_" + Math.random().toString(36).substring(2, 15),
      options: {
        data: {
          nom_complet,
          etablissement_id,
          filiere_id,
          niveau_id,
          date_naissance,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    // ✅ Confirmation email sent
    setStep(5);
  }

  async function creerCompteApresConfirmation() {
    setBusy(true);
    setError("");

    try {
      // User clicked confirmation link and is now authenticated
      // Update password to the one they chose
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setBusy(false);
        return;
      }

      // Finalize student signup (create student role, etudiant record, etc.)
      await finalizeStudentSignup({
        data: {
          etablissement_id,
          filiere_id,
          niveau_id,
          nom_complet,
          date_naissance,
        },
      });

      setStep(7);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link to="/login" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Déjà inscrit ? Se connecter
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          {step === 1 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 1 / 6</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Sélectionnez votre établissement</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choisissez l'université ou l'école dans laquelle vous êtes inscrit.
              </p>
              <select
                value={etablissement_id}
                onChange={e => setEtab(e.target.value)}
                className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              >
                <option value="">— Choisir —</option>
                {etabs.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
              {etabs.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Aucun établissement partenaire actif pour le moment.
                </p>
              )}
              <button
                disabled={!etablissement_id}
                onClick={() => setStep(2)}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Continuer
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 2 / 6</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Filière & niveau</h1>
              <div className="mt-6 space-y-3">
                <select
                  value={filiere_id}
                  onChange={e => setFiliere(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="">— Filière —</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
                <select
                  value={niveau_id}
                  onChange={e => setNiveau(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="">— Niveau —</option>
                  {niveaux.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  Retour
                </button>
                <button
                  disabled={!filiere_id || !niveau_id}
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 3 / 6</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérification d'identité</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ces informations seront comparées à la liste officielle importée par votre établissement.
              </p>
              <div className="mt-6 space-y-3">
                <input
                  value={nom_complet}
                  onChange={e => setNom(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="date"
                  value={date_naissance}
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  Retour
                </button>
                <button
                  disabled={!nom_complet || !date_naissance || busy}
                  onClick={verifierIdentite}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Vérifier mon identité"}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">✓ Identité confirmée</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Confirmez votre email</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrez votre adresse email. Un lien de confirmation sera envoyé pour valider votre inscription.
              </p>
              <div className="mt-6 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <button
                disabled={busy || !email}
                onClick={envoyerConfirmationEmail}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Envoi…" : "Recevoir un lien de confirmation"}
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                ✓ Email de confirmation envoyé
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérifiez votre email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Cliquez sur ce lien pour
                continuer votre inscription.
              </p>
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-900">
                  💡 <strong>N'oubliez pas de vérifier votre dossier Spam ou Promotions</strong> si vous ne voyez
                  pas l'email.
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Une fois confirmé, cliquez sur le bouton ci-dessous pour créer votre mot de passe.
              </p>
              <button
                disabled={busy}
                onClick={() => setStep(6)}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Finalisation…" : "Créer mon mot de passe"}
              </button>
            </>
          )}

          {step === 6 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">✓ Email confirmé</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Créez votre mot de passe</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Définissez un mot de passe sécurisé pour votre compte étudiant.
              </p>
              <div className="mt-6 space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mot de passe (8 caractères min)"
                  minLength={8}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <button
                disabled={busy || password.length < 8}
                onClick={creerCompteApresConfirmation}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Finalisation…" : "Finaliser mon inscription"}
              </button>
            </>
          )}

          {step === 7 && (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">
                ✓
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold">Compte créé !</h1>
              <p className="mt-2 text-sm text-muted-foreground">Votre espace étudiant est prêt.</p>
              <Link
                to="/app"
                className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Ouvrir mon espace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
