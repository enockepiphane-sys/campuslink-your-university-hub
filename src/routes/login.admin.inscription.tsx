import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminAuthorization, finalizeAdminSignup } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login/admin/inscription")({
  component: AdminSignup,
  head: () => ({ meta: [{ title: "Inscription administrateur — CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Step = "identity" | "password";

function AdminSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identity");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [etablissement_id, setEtabId] = useState("");
  const [nom_complet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [date_naissance, setDateNaissance] = useState("");
  const [telephone, setTelephone] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").eq("statut", "actif").order("nom").then(({ data }) => setEtabs(data ?? []));
  }, []);

  async function verifyIdentity(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setAlreadyRegistered(false);

    try {
      const result = await checkAdminAuthorization({
        data: { etablissement_id, nom_complet, email, date_naissance, telephone },
      });

      if (!result.authorized) {
        setError("Vos informations ne correspondent à aucun administrateur préinscrit pour cet établissement. Contactez le super administrateur.");
        setBusy(false);
        return;
      }
      if (result.has_password) {
        setAlreadyRegistered(true);
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

      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setError("Compte créé. Veuillez vous connecter.");
        setBusy(false);
        return;
      }
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du compte");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          {step === "identity" ? (
            <Link to="/login" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">← Retour</Link>
          ) : (
            <button onClick={() => { setStep("identity"); setError(""); }} className="text-xs font-medium text-muted-foreground hover:text-foreground">← Retour</button>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          {alreadyRegistered ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Vous êtes déjà inscrit(e)</p>
              <p className="mt-1">Un mot de passe existe déjà pour ce compte administrateur. Veuillez utiliser « Se connecter à mon compte administrateur ».</p>
              <Link to="/login/admin" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Aller à la connexion →</Link>
            </div>
          ) : step === "identity" ? (
            <>
              <h1 className="font-display text-2xl font-bold">Inscription administrateur</h1>
              <p className="mt-1 text-sm text-muted-foreground">Renseignez vos informations. Elles seront vérifiées dans la liste des administrateurs préinscrits de votre établissement.</p>
              <form className="mt-6 space-y-4" onSubmit={verifyIdentity}>
                <div>
                  <label className="text-xs font-medium">Nom complet</label>
                  <input value={nom_complet} onChange={(e) => setNomComplet(e.target.value)} required placeholder="Ex: Jean Ouédraogo" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium">Établissement</label>
                  <select value={etablissement_id} onChange={(e) => setEtabId(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm">
                    <option value="">— Sélectionner —</option>
                    {etabs.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
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
                  <label className="text-xs font-medium">Numéro de téléphone</label>
                  <input value={telephone} onChange={(e) => setTelephone(e.target.value)} required placeholder="Ex: +226 70 00 00 00" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
                </div>
                {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
                <button type="submit" disabled={busy || !nom_complet || !etablissement_id || !email || !date_naissance || !telephone} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {busy ? "Vérification…" : "Vérifier mon identité"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Créer votre mot de passe</h1>
              <p className="mt-1 text-sm text-muted-foreground">Votre identité a été vérifiée. Créez votre tout premier mot de passe.</p>
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
        </div>
      </div>
    </div>
  );
}
