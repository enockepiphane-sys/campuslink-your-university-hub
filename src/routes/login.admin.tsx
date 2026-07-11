import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { checkAdminAuthorization, finalizeAdminSignup } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login/admin")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Connexion professionnel — CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Step = "establishment" | "identity" | "password" | "login";

function AdminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("establishment");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [etablissement_id, setEtabId] = useState("");
  const [etabName, setEtabName] = useState("");

  // Identity fields
  const [nom_complet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [date_naissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");

  // Password creation (first-time)
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Returning admin: just email + password
  const [returningEmail, setReturningEmail] = useState("");
  const [returningPassword, setReturningPassword] = useState("");

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").eq("statut", "actif").order("nom").then(({ data }) => setEtabs(data ?? []));
  }, []);

  function backToEstablishment() {
    setStep("establishment");
    setError("");
    setNomComplet("");
    setEmail("");
    setDateNaissance("");
    setTelephone("");
    setPassword("");
    setPasswordConfirm("");
  }

  function backToIdentity() {
    setStep("password");
    setError("");
    setPassword("");
    setPasswordConfirm("");
  }

  // Step 1: establishment selected → go to identity form
  function selectEstablishment() {
    if (!etablissement_id) return;
    const etab = etabs.find((e) => e.id === etablissement_id);
    setEtabName(etab?.nom ?? "");
    setStep("identity");
    setError("");
  }

  // Step 2: identity form submitted → check authorization
  async function checkIdentity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await checkAdminAuthorization({
        data: { etablissement_id, nom_complet, email, date_naissance, telephone },
      });

      if (!result.authorized) {
        setError("Vos informations ne correspondent à aucun administrateur autorisé pour cet établissement. Accès refusé.");
        setBusy(false);
        return;
      }

      if (result.has_password) {
        // Already has a password → go to simple login
        setReturningEmail(email);
        setStep("login");
        setBusy(false);
      } else {
        // First time → create password
        setStep("password");
        setBusy(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
      setBusy(false);
    }
  }

  // Step 3a: first-time admin creates password
  async function createPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      setBusy(false);
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setBusy(false);
      return;
    }

    try {
      await finalizeAdminSignup({
        data: { etablissement_id, nom_complet, email, date_naissance, telephone, password },
      });

      // Auto-login
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setError("Compte créé. Veuillez vous connecter avec votre email et mot de passe.");
        setStep("login");
        setReturningEmail(email);
        setBusy(false);
        return;
      }
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte");
      setBusy(false);
    }
  }

  // Step 3b: returning admin logs in
  async function loginReturning(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: returningEmail,
      password: returningPassword,
    });

    if (signInErr) {
      setError(signInErr.message);
      setBusy(false);
      return;
    }

    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          {step !== "establishment" && (
            <button
              onClick={step === "login" ? backToEstablishment : step === "password" ? backToIdentity : backToEstablishment}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Retour
            </button>
          )}
          {step === "establishment" && (
            <Link to="/" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Retour
            </Link>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          {/* STEP 1: SELECT ESTABLISHMENT */}
          {step === "establishment" && (
            <>
              <h1 className="font-display text-2xl font-bold">Accéder au compte professionnel</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sélectionnez votre établissement pour continuer.</p>
              <div className="mt-6 space-y-2">
                {etabs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun établissement disponible.</p>
                ) : (
                  etabs.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { setEtabId(e.id); setEtabName(e.nom); }}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${etablissement_id === e.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-background hover:bg-muted"}`}
                    >
                      {e.nom}
                    </button>
                  ))
                )}
              </div>
              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
              <button onClick={selectEstablishment} disabled={!etablissement_id} className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                Continuer
              </button>
            </>
          )}

          {/* STEP 2: IDENTITY FORM */}
          {step === "identity" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">{etabName}</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérification d'identité</h1>
              <p className="mt-1 text-sm text-muted-foreground">Saisissez vos informations personnelles. Elles doivent correspondre à celles enregistrées par l'administrateur de la plateforme.</p>
              <form className="mt-6 space-y-4" onSubmit={checkIdentity}>
                <div>
                  <label className="text-xs font-medium">Nom complet</label>
                  <input value={nom_complet} onChange={(e) => setNomComplet(e.target.value)} required placeholder="Ex: Jean Ouédraogo" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre.email@gmail.com" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Date de naissance</label>
                  <input type="date" value={date_naissance} onChange={(e) => setDateNaissance(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Téléphone</label>
                  <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Ex: +226 70 00 00 00" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <button type="submit" disabled={busy || !nom_complet || !email || !date_naissance} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {busy ? "Vérification…" : "Vérifier mon identité"}
                </button>
              </form>
            </>
          )}

          {/* STEP 3a: CREATE PASSWORD (first-time) */}
          {step === "password" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">{etabName}</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Créer votre mot de passe</h1>
              <p className="mt-1 text-sm text-muted-foreground">C'est votre première connexion. Créez un mot de passe pour votre compte administrateur.</p>
              <form className="mt-6 space-y-4" onSubmit={createPassword}>
                <div>
                  <label className="text-xs font-medium">Mot de passe (min. 6 caractères)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Confirmer le mot de passe</label>
                  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={6} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <button type="submit" disabled={busy || !password || !passwordConfirm} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {busy ? "Création…" : "Créer mon compte et me connecter"}
                </button>
              </form>
            </>
          )}

          {/* STEP 3b: RETURNING ADMIN LOGIN */}
          {step === "login" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">{etabName}</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Connexion administrateur</h1>
              <p className="mt-1 text-sm text-muted-foreground">Votre compte est déjà configuré. Saisissez votre mot de passe pour vous connecter.</p>
              <form className="mt-6 space-y-4" onSubmit={loginReturning}>
                <div>
                  <label className="text-xs font-medium">Email</label>
                  <input type="email" value={returningEmail} onChange={(e) => setReturningEmail(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Mot de passe</label>
                  <input type="password" value={returningPassword} onChange={(e) => setReturningPassword(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <button type="submit" disabled={busy || !returningEmail || !returningPassword} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {busy ? "Connexion…" : "Se connecter"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
