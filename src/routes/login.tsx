import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { checkUserStatus, finalizeUnifiedLogin } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

type Step = "credentials" | "selection" | "otp";

type Etab = { id: string; nom: string };
type Filiere = { id: string; nom: string };
type Niveau = { id: string; nom: string };

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [date_naissance, setDate] = useState("");
  const [otp, setOtp] = useState("");

  // Selection state
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [etablissement_id, setEtab] = useState("");
  const [filiere_id, setFiliere] = useState("");
  const [niveau_id, setNiveau] = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<"returning" | "first_time" | "need_more_info" | "not_found" | null>(null);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);

  // Load establishments when entering selection step
  useEffect(() => {
    if (step === "selection") {
      supabase.from("etablissements").select("id,nom").eq("statut", "actif").order("nom").then(({ data }) => {
        setEtabs(data ?? []);
      });
    }
  }, [step]);

  // Load filieres when establishment is selected
  useEffect(() => {
    if (etablissement_id) {
      supabase.from("filieres").select("id,nom").eq("etablissement_id", etablissement_id).order("nom").then(({ data }) => {
        setFilieres(data ?? []);
      });
      setFiliere("");
      setNiveau("");
      setNiveaux([]);
    }
  }, [etablissement_id]);

  // Load niveaux when filiere is selected
  useEffect(() => {
    if (etablissement_id && filiere_id) {
      supabase.from("niveaux").select("id,nom").eq("etablissement_id", etablissement_id).eq("filiere_id", filiere_id).order("ordre").then(({ data }) => {
        setNiveaux(data ?? []);
      });
      setNiveau("");
    }
  }, [etablissement_id, filiere_id]);

  // Step 1: Check user with email + date_naissance
  async function checkCredentials(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await checkUserStatus({ data: { email, date_naissance } });

      if (!result.found) {
        if (result.status === "need_more_info") {
          // First-time user, need to select establishment/filiere/niveau
          setUserStatus("need_more_info");
          setStep("selection");
          setBusy(false);
          return;
        }
        setError("Aucun compte trouvé avec ces informations. Vérifiez vos informations ou contactez votre administration.");
        setBusy(false);
        return;
      }

      // Found: returning or first_time with enough info
      setUserStatus(result.status);
      setDetectedRole(result.role);
      await sendOtp();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de recherche");
      setBusy(false);
    }
  }

  // Send OTP email
  async function sendOtp() {
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { email, date_naissance },
      },
    });

    if (otpErr) {
      setError(otpErr.message);
      setBusy(false);
      return;
    }

    setStep("otp");
    setBusy(false);
  }

  // Step 2 (selection): Check first-time user with full info
  async function checkWithSelection(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (!etablissement_id) {
      setError("Veuillez sélectionner un établissement.");
      setBusy(false);
      return;
    }

    try {
      const result = await checkUserStatus({
        data: { email, date_naissance, etablissement_id, filiere_id, niveau_id },
      });

      if (!result.found) {
        setError("Aucun compte trouvé avec ces informations. Vérifiez votre établissement, filière et niveau, ou contactez votre administration.");
        setBusy(false);
        return;
      }

      setUserStatus(result.status);
      setDetectedRole(result.role);
      await sendOtp();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de recherche");
      setBusy(false);
    }
  }

  // Step 3: Verify OTP
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
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
      try {
        await finalizeUnifiedLogin({
          data: { email, date_naissance, etablissement_id, filiere_id, niveau_id },
        });
      } catch (err: unknown) {
        console.error("Finalisation échouée:", err);
        await supabase.auth.signOut();
        setError(err instanceof Error ? err.message : "Erreur lors de la finalisation du compte.");
        setBusy(false);
        return;
      }
    }

    setBusy(false);
  }

  const roleLabel =
    detectedRole === "super_admin" ? "Super administrateur"
    : detectedRole === "admin_etablissement" ? "Administrateur d'établissement"
    : detectedRole === "etudiant" ? "Étudiant"
    : detectedRole === "professeur" ? "Professeur"
    : null;

  function backToCredentials() {
    setStep("credentials");
    setError("");
    setDetectedRole(null);
    setUserStatus(null);
  }

  function backToSelection() {
    setStep("selection");
    setError("");
    setOtp("");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <Logo />
          {(step === "otp" || step === "selection") && (
            <button
              onClick={step === "otp" ? (userStatus === "returning" ? backToCredentials : backToSelection) : backToCredentials}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          {/* STEP 1: CREDENTIALS */}
          {step === "credentials" && (
            <>
              <h1 className="font-display text-2xl font-bold">Se connecter</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Saisissez votre email et votre date de naissance. Si c'est votre première connexion, vous devrez également sélectionner votre établissement, filière et niveau.
              </p>
              <form className="mt-6 space-y-4" onSubmit={checkCredentials}>
                <div>
                  <label className="text-xs font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@gmail.com"
                    required
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Date de naissance</label>
                  <input
                    type="date"
                    value={date_naissance}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={!email || !date_naissance || busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Recherche…" : "Continuer"}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: SELECTION (first-time users only) */}
          {step === "selection" && (
            <>
              <h1 className="font-display text-2xl font-bold">Première connexion</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Nous n'avons pas trouvé de compte vérifié avec ces informations. Sélectionnez votre établissement, filière et niveau pour vérifier votre identité.
              </p>
              <form className="mt-6 space-y-4" onSubmit={checkWithSelection}>
                <div>
                  <label className="text-xs font-medium">Établissement</label>
                  <select
                    value={etablissement_id}
                    onChange={(e) => setEtab(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                  >
                    <option value="">— Sélectionner —</option>
                    {etabs.map((e) => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </div>
                {etablissement_id && (
                  <div>
                    <label className="text-xs font-medium">Filière</label>
                    <select
                      value={filiere_id}
                      onChange={(e) => setFiliere(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                    >
                      <option value="">— Sélectionner —</option>
                      {filieres.map((f) => (
                        <option key={f.id} value={f.id}>{f.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
                {filiere_id && (
                  <div>
                    <label className="text-xs font-medium">Niveau</label>
                    <select
                      value={niveau_id}
                      onChange={(e) => setNiveau(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                    >
                      <option value="">— Sélectionner —</option>
                      {niveaux.map((n) => (
                        <option key={n.id} value={n.id}>{n.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
                {error && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={!etablissement_id || busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Vérifier mon identité"}
                </button>
              </form>
            </>
          )}

          {/* STEP 3: OTP */}
          {step === "otp" && (
            <>
              {roleLabel && (
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                  Compte détecté : {roleLabel}
                </p>
              )}
              <h1 className="font-display text-2xl font-bold">Entrez le code reçu</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Un code de vérification a été envoyé à <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Le code est valide pendant 3 minutes.</p>
              <form className="mt-6 space-y-4" onSubmit={verifyOtp}>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Code à 6 chiffres"
                  maxLength={6}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-2xl tracking-widest"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={otp.length !== 6 || busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Vérification…" : "Confirmer et se connecter"}
                </button>
              </form>
              <button
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  await sendOtp();
                }}
                disabled={busy}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Renvoyer le code
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
