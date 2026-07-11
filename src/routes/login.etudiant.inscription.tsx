import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { registerStudent, verifyStudentInList } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login/etudiant/inscription")({
  component: StudentRegistration,
  head: () => ({ meta: [{ title: "Inscription étudiant — CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Filiere = { id: string; nom: string };
type Niveau = { id: string; nom: string };
type Step = "selection" | "identity" | "password";

function StudentRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("selection");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [success, setSuccess] = useState(false);

  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  const [etablissement_id, setEtab] = useState("");
  const [filiere_id, setFiliere] = useState("");
  const [niveau_id, setNiveau] = useState("");

  const [nom_complet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [date_naissance, setDateNaissance] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").eq("statut", "actif").order("nom").then(({ data }) => setEtabs(data ?? []));
  }, []);

  useEffect(() => {
    if (etablissement_id) {
      supabase.from("filieres").select("id,nom").eq("etablissement_id", etablissement_id).order("nom").then(({ data }) => setFilieres(data ?? []));
      setFiliere("");
      setNiveau("");
      setNiveaux([]);
    }
  }, [etablissement_id]);

  useEffect(() => {
    if (etablissement_id && filiere_id) {
      supabase.from("niveaux").select("id,nom").eq("etablissement_id", etablissement_id).eq("filiere_id", filiere_id).order("ordre").then(({ data }) => setNiveaux(data ?? []));
      setNiveau("");
    }
  }, [etablissement_id, filiere_id]);

  function goToIdentity() {
    if (!etablissement_id || !filiere_id || !niveau_id) return;
    setError("");
    setStep("identity");
  }

  async function verifyIdentity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setAlreadyRegistered(false);

    try {
      const result = await verifyStudentInList({
        data: { etablissement_id, filiere_id, niveau_id, nom_complet, email, date_naissance },
      });

      if (result.status === "already_registered") {
        setAlreadyRegistered(true);
        setBusy(false);
        return;
      }
      if (result.status === "not_in_list") {
        setError("Vos informations ne correspondent à aucun étudiant préinscrit dans la liste administrative de cet établissement, cette filière et ce niveau. Contactez votre administration.");
        setBusy(false);
        return;
      }
      setStep("password");
      setBusy(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
      setBusy(false);
    }
  }

  async function createAccount(e: React.FormEvent) {
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
      const result = await registerStudent({
        data: { email, password, nom_complet, date_naissance, etablissement_id, filiere_id, niveau_id },
      });

      if (!result.created && result.reason === "already_registered") {
        setAlreadyRegistered(true);
        setBusy(false);
        return;
      }

      setSuccess(true);
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInErr) {
        setTimeout(() => navigate({ to: "/app" }), 1200);
      }
      setBusy(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          {step === "selection" ? (
            <Link to="/login" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">← Retour</Link>
          ) : (
            <button onClick={() => { setStep(step === "password" ? "identity" : "selection"); setError(""); }} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">← Retour</button>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          {alreadyRegistered ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Vous êtes déjà inscrit(e)</p>
              <p className="mt-1">Un compte existe déjà avec cet email. Veuillez aller dans la section « Se connecter au compte étudiant » pour accéder à votre espace.</p>
              <Link to="/login/etudiant" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Aller à la connexion →</Link>
            </div>
          ) : success ? (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">✓ Inscription réussie !</p>
              <p className="mt-1">Redirection vers votre espace étudiant…</p>
            </div>
          ) : step === "selection" ? (
            <>
              <h1 className="font-display text-2xl font-bold">Inscription étudiant</h1>
              <p className="mt-1 text-sm text-muted-foreground">Sélectionnez votre établissement, votre filière et votre niveau.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium">Établissement</label>
                  <select value={etablissement_id} onChange={(e) => setEtab(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
                    <option value="">— Sélectionner —</option>
                    {etabs.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </div>
                {etablissement_id && (
                  <div>
                    <label className="text-xs font-medium">Filière</label>
                    <select value={filiere_id} onChange={(e) => setFiliere(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
                      <option value="">— Sélectionner —</option>
                      {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                  </div>
                )}
                {filiere_id && (
                  <div>
                    <label className="text-xs font-medium">Niveau</label>
                    <select value={niveau_id} onChange={(e) => setNiveau(e.target.value)} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
                      <option value="">— Sélectionner —</option>
                      {niveaux.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={goToIdentity} disabled={!etablissement_id || !filiere_id || !niveau_id} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  Continuer
                </button>
              </div>
            </>
          ) : step === "identity" ? (
            <>
              <h1 className="font-display text-2xl font-bold">Vérification d'identité</h1>
              <p className="mt-1 text-sm text-muted-foreground">Ces informations seront vérifiées dans la liste administrative des étudiants préinscrits.</p>
              <form className="mt-6 space-y-4" onSubmit={verifyIdentity}>
                <div>
                  <label className="text-xs font-medium">Nom complet</label>
                  <input value={nom_complet} onChange={(e) => setNomComplet(e.target.value)} required placeholder="Ex: Marie Compaoré" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre.email@gmail.com" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Date de naissance</label>
                  <input type="date" value={date_naissance} onChange={(e) => setDateNaissance(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <button type="submit" disabled={busy || !nom_complet || !email || !date_naissance} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {busy ? "Vérification…" : "Vérifier mon identité"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Créer votre mot de passe</h1>
              <p className="mt-1 text-sm text-muted-foreground">Votre identité a été vérifiée. Créez un mot de passe pour finaliser votre compte étudiant.</p>
              <form className="mt-6 space-y-4" onSubmit={createAccount}>
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
                  {busy ? "Création…" : "Créer mon compte étudiant"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
