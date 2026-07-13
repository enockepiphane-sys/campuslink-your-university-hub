import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { finalizeAdminSignup } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/register-admin")({
  component: RegisterAdminPage,
  head: () => ({ meta: [{ title: "Inscription administrateur — CampusLink" }] }),
});

type Etab = { id: string; nom: string };

function RegisterAdminPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  // Steps: 1=establishment, 2=email, 3=check_email, 4=password, 5=success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [etablissement_id, setEtab] = useState("");
  const [email, setEmail] = useState("");
  const [nom_complet, setNom] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase
      .from("etablissements")
      .select("id,nom")
      .order("nom")
      .then(({ data }) => setEtabs(data ?? []));
  }, []);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) navigate({ to: roleHomePath(auth.role) });
  }, [auth, navigate]);

  async function verifierPreAutorisation() {
    setBusy(true);
    setError("");

    // Check if email is pre-authorized as admin for this establishment
    // We'll call a custom RPC function to verify
    const { data: isPreAuthorized, error: rpcError } = await supabase.rpc(
      "verify_admin_preauth",
      {
        _email: email,
        _etablissement_id: etablissement_id,
      }
    );

    if (rpcError) {
      setError("Erreur lors de la vérification : " + rpcError.message);
      setBusy(false);
      return;
    }

    if (!isPreAuthorized) {
      setError(
        "Cet email n'est pas pré-autorisé comme administrateur pour cet établissement. Contactez le super administrateur CampusLink."
      );
      setBusy(false);
      return;
    }

    // Get admin name from pre-auth
    const { data: adminData } = await supabase
      .from("admins")
      .select("nom_complet")
      .eq("email", email)
      .eq("etablissement_id", etablissement_id)
      .single();

    if (adminData?.nom_complet) {
      setNom(adminData.nom_complet);
    }

    setBusy(false);
    // ✅ Pre-authorization verified, move to email confirmation step
    setStep(3);
  }

  async function envoyerConfirmationEmail() {
    setBusy(true);
    setError("");

    // Check if email already has an account
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
          nom_complet: nom_complet || email,
          etablissement_id,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?role=admin`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    // ✅ Confirmation email sent
    setStep(4);
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

      // Finalize admin signup (create admin role, update admin record, etc.)
      await finalizeAdminSignup({
        data: {
          etablissement_id,
        },
      });

      setStep(5);
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
          <Link
            to="/login"
            search={{ role: "admin_etablissement" }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Déjà administrateur ? Se connecter
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-terracotta" : "bg-border"}`} />
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          {step === 1 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 1 / 4</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Sélectionnez votre établissement</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Choisissez l'établissement dont vous êtes administrateur.
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
              <button
                disabled={!etablissement_id}
                onClick={() => setStep(2)}
                className="mt-6 w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Continuer
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 2 / 4</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérification de pré-autorisation</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrez l'email avec lequel vous avez été pré-autorisé par le super administrateur.
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
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  Retour
                </button>
                <button
                  disabled={busy || !email}
                  onClick={verifierPreAutorisation}
                  className="flex-1 rounded-xl bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Vérifier"}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                ✓ Email pré-autorisé
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">Confirmer votre email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Un lien de confirmation sera envoyé à <strong>{email}</strong>. Cliquez sur ce lien pour continuer.
              </p>
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-900">
                  💡 <strong>N'oubliez pas de vérifier votre dossier Spam ou Promotions</strong> si vous ne voyez
                  pas l'email.
                </p>
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <button
                disabled={busy}
                onClick={envoyerConfirmationEmail}
                className="mt-6 w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Envoi…" : "Envoyer lien de confirmation"}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                ✓ Email de confirmation envoyé
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérifiez votre email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Un lien a été envoyé à <strong>{email}</strong>. Cliquez dessus pour continuer votre inscription.
              </p>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Une fois confirmé, définissez votre mot de passe ci-dessous.
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
                className="mt-6 w-full rounded-xl bg-terracotta py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Finalisation…" : "Finaliser mon inscription"}
              </button>
            </>
          )}

          {step === 5 && (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">
                ✓
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold">Compte créé !</h1>
              <p className="mt-2 text-sm text-muted-foreground">Votre espace administrateur est prêt.</p>
              <Link
                to="/admin"
                className="mt-6 inline-flex rounded-xl bg-terracotta px-6 py-3 text-sm font-semibold text-white"
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
