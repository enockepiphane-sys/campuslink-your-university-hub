import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { claimSuperAdminIfEmpty } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Ref = { id: string; nom: string };
type Step = "select-role" | "student-etab" | "student-filiere" | "student-verify" | "student-otp" | "admin-login" | "admin-signup";

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select-role");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Student flow state
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [filieres, setFilieres] = useState<Ref[]>([]);
  const [niveaux, setNiveaux] = useState<Ref[]>([]);
  const [etablissement_id, setEtab] = useState("");
  const [filiere_id, setFiliere] = useState("");
  const [niveau_id, setNiveau] = useState("");
  const [nom_complet, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [date_naissance, setDate] = useState("");
  const [otp, setOtp] = useState("");

  // Admin flow state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminNom, setAdminNom] = useState("");

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").eq("statut", "actif").order("nom")
      .then(({ data }) => setEtabs(data ?? []));
  }, []);

  useEffect(() => {
    if (!etablissement_id) return;
    supabase.from("filieres").select("id,nom").eq("etablissement_id", etablissement_id).order("nom")
      .then(({ data }) => setFilieres(data ?? []));
    supabase.from("niveaux").select("id,nom").eq("etablissement_id", etablissement_id).order("ordre")
      .then(({ data }) => setNiveaux(data ?? []));
  }, [etablissement_id]);

  async function verifyStudentAndSendOTP() {
    setBusy(true);
    setError("");

    // Verify student exists in liste_officielle
    const { data: verified, error: vErr } = await supabase.rpc("verify_student_by_email", {
      _etablissement_id: etablissement_id,
      _filiere_id: filiere_id,
      _niveau_id: niveau_id,
      _nom_complet: nom_complet,
      _email: email,
      _date_naissance: date_naissance,
    });

    if (vErr) {
      setError(vErr.message);
      setBusy(false);
      return;
    }

    if (!verified) {
      setError("Aucune correspondance trouvée. Vérifiez vos informations ou contactez l'administration de votre établissement pour vous inscrire.");
      setBusy(false);
      return;
    }

    // Send OTP via Supabase
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          nom_complet,
          etablissement_id,
          filiere_id,
          niveau_id,
          date_naissance,
          role: "etudiant",
        },
      },
    });

    if (otpErr) {
      setError(otpErr.message);
      setBusy(false);
      return;
    }

    setStep("student-otp");
    setBusy(false);
  }

  async function verifyOTP() {
    setBusy(true);
    setError("");

    const { data, error: vErr } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (vErr) {
      setError(vErr.message);
      setBusy(false);
      return;
    }

    if (data.user) {
      // Finalize student account
      await finalizeStudentAccount(data.user.id);
    }

    setBusy(false);
  }

  async function finalizeStudentAccount(userId: string) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update profile
    await supabaseAdmin.from("profiles").update({
      nom_complet,
      etablissement_id,
      date_naissance,
    }).eq("id", userId);

    // Create role
    await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: "etudiant",
      etablissement_id,
    }, { onConflict: "user_id,role,etablissement_id" });

    // Create student record
    await supabaseAdmin.from("etudiants").insert({
      user_id: userId,
      etablissement_id,
      filiere_id,
      niveau_id,
      nom_complet,
      email,
      date_naissance,
    });

    // Mark as used in liste_officielle
    await supabaseAdmin.from("liste_officielle")
      .update({ utilise: true })
      .eq("etablissement_id", etablissement_id)
      .eq("filiere_id", filiere_id)
      .eq("niveau_id", niveau_id)
      .eq("date_naissance", date_naissance)
      .ilike("nom_complet", nom_complet.trim())
      .ilike("email", email.trim());
  }

  async function adminLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    try {
      await claimSuperAdminIfEmpty();
    } catch {
      // ignore
    }
    setBusy(false);
  }

  async function adminSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: { data: { nom_complet: adminNom } },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    try {
      await claimSuperAdminIfEmpty();
    } catch {
      // ignore
    }
    setBusy(false);
  }

  const etabName = etabs.find((e) => e.id === etablissement_id)?.nom || "";
  const filiereName = filieres.find((f) => f.id === filiere_id)?.nom || "";
  const niveauName = niveaux.find((n) => n.id === niveau_id)?.nom || "";

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <Logo />
          {step !== "select-role" && (
            <button
              onClick={() => {
                if (step === "student-etab") setStep("select-role");
                else if (step === "student-filiere") setStep("student-etab");
                else if (step === "student-verify") setStep("student-filiere");
                else if (step === "student-otp") setStep("student-verify");
                else if (step === "admin-login" || step === "admin-signup") setStep("select-role");
              }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          )}
        </div>

        {/* Progress bar for student flow */}
        {step.startsWith("student") && step !== "select-role" && (
          <div className="mb-6 flex items-center gap-2">
            {["student-etab", "student-filiere", "student-verify", "student-otp"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  ["student-etab", "student-filiere", "student-verify", "student-otp"].indexOf(step) >= i
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          {step === "select-role" && (
            <>
              <h1 className="font-display text-2xl font-bold">Bienvenue sur CampusLink</h1>
              <p className="mt-1 text-sm text-muted-foreground">Comment souhaitez-vous vous connecter ?</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setStep("student-etab")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-lg">🎓</div>
                    <div>
                      <p className="text-sm font-semibold">Étudiant</p>
                      <p className="text-xs text-muted-foreground">Accédez à vos notes, annonces et événements</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-muted-foreground">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => setStep("admin-login")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold/20 text-lg">👤</div>
                    <div>
                      <p className="text-sm font-semibold">Administrateur</p>
                      <p className="text-xs text-muted-foreground">Gérez votre établissement</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-muted-foreground">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {step === "student-etab" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 1 / 4 — Établissement</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Sélectionnez votre établissement</h1>
              <p className="mt-1 text-sm text-muted-foreground">Choisissez l'université ou l'école dans laquelle vous êtes inscrit.</p>
              <select
                value={etablissement_id}
                onChange={(e) => {
                  setEtab(e.target.value);
                  setFiliere("");
                  setNiveau("");
                }}
                className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
              >
                <option value="">— Choisir un établissement —</option>
                {etabs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
              {etabs.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Aucun établissement partenaire actif pour le moment.</p>
              )}
              <button
                disabled={!etablissement_id}
                onClick={() => setStep("student-filiere")}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Continuer
              </button>
            </>
          )}

          {step === "student-filiere" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 2 / 4 — Filière & Niveau</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Sélectionnez votre filière et niveau</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Établissement : <span className="font-medium text-foreground">{etabName}</span>
              </p>
              <div className="mt-6 space-y-3">
                <select
                  value={filiere_id}
                  onChange={(e) => setFiliere(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="">— Filière —</option>
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
                <select
                  value={niveau_id}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                >
                  <option value="">— Niveau —</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nom}
                    </option>
                  ))}
                </select>
              </div>
              {filieres.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Aucune filière configurée pour cet établissement.</p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("student-etab")}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  disabled={!filiere_id || !niveau_id}
                  onClick={() => setStep("student-verify")}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>
            </>
          )}

          {step === "student-verify" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Étape 3 / 4 — Vérification</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Vérifiez votre identité</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {etabName} → {filiereName} → {niveauName}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Saisissez vos informations personnelles. Elles doivent correspondre à celles enregistrées par votre administration.
              </p>
              <div className="mt-6 space-y-3">
                <input
                  value={nom_complet}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom complet (ex: Jean DUPONT)"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email (ex: jean.dupont@gmail.com)"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="date"
                  value={date_naissance}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Date de naissance"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              {error && (
                <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                  <p className="font-medium">Identité non reconnue</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("student-filiere")}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  disabled={!nom_complet || !email || !date_naissance || busy}
                  onClick={verifyStudentAndSendOTP}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Recevoir un code de vérification"}
                </button>
              </div>
            </>
          )}

          {step === "student-otp" && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Étape 4 / 4 — Code de vérification</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Entrez le code reçu</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Un code de vérification a été envoyé à <span className="font-medium text-foreground">{email}</span>
              </p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Code à 6 chiffres"
                maxLength={6}
                className="mt-6 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-2xl tracking-widest"
              />
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("student-verify")}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-medium"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Retour
                </button>
                <button
                  disabled={otp.length !== 6 || busy}
                  onClick={verifyOTP}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Confirmer"}
                </button>
              </div>
              <button
                onClick={verifyStudentAndSendOTP}
                disabled={busy}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Renvoyer le code
              </button>
            </>
          )}

          {step === "admin-login" && (
            <>
              <h1 className="font-display text-2xl font-bold">Connexion administrateur</h1>
              <p className="mt-1 text-sm text-muted-foreground">Accédez à votre espace de gestion.</p>
              <form className="mt-6 space-y-3" onSubmit={adminLogin}>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email professionnel"
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Connexion…" : "Se connecter"}
                </button>
              </form>
              <button
                onClick={() => {
                  setStep("admin-signup");
                  setError("");
                }}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Pas encore de compte ? Créer un compte administrateur
              </button>
            </>
          )}

          {step === "admin-signup" && (
            <>
              <h1 className="font-display text-2xl font-bold">Créer un compte administrateur</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Uniquement pour les super administrateurs de la plateforme.
              </p>
              <form className="mt-6 space-y-3" onSubmit={adminSignup}>
                <input
                  value={adminNom}
                  onChange={(e) => setAdminNom(e.target.value)}
                  placeholder="Nom complet"
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Email professionnel"
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mot de passe (8 caractères min)"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Création…" : "Créer mon compte"}
                </button>
              </form>
              <button
                onClick={() => {
                  setStep("admin-login");
                  setError("");
                }}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                J'ai déjà un compte
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © CampusLink — Plateforme du Burkina Faso
        </p>
      </div>
    </div>
  );
}
