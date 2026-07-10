import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { lookupUser, finalizeUnifiedLogin } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

type Step = "credentials" | "otp";

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [date_naissance, setDate] = useState("");
  const [otp, setOtp] = useState("");
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (step !== "otp" || !expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, expiresAt]);

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);


  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    // 1. Vérifier qu'un compte existe
    let result;
    try {
      result = await lookupUser({ data: { email, date_naissance } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de recherche");
      setBusy(false);
      return;
    }

    if (!result.found) {
      setError("Aucun compte trouvé avec ces informations. Contactez votre administration.");
      setBusy(false);
      return;
    }

    setDetectedRole(result.role);

    // 2. Envoyer l'OTP par email
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { email, date_naissance, role: result.role },
      },
    });

    if (otpErr) {
      setError(otpErr.message);
      setBusy(false);
      return;
    }

    setExpiresAt(Date.now() + 10 * 60 * 1000); // code valide 10 min côté UI
    setOtp("");
    setStep("otp");
    setBusy(false);
  }

  const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : 0;
  const isExpired = step === "otp" && expiresAt !== null && secondsLeft === 0;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (isExpired) {
      setError("Le code a expiré. Renvoyez un nouveau code.");
      return;
    }
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
      // Finaliser le compte côté serveur
      try {
        await finalizeUnifiedLogin({ data: { email, date_naissance } });
      } catch (err: unknown) {
        // Si la finalisation échoue, on déconnecte pour éviter un état incohérent
        console.error("Finalisation échouée:", err);
        await supabase.auth.signOut();
        setError(err instanceof Error ? err.message : "Erreur lors de la finalisation du compte.");
        setBusy(false);
        return;
      }
    }

    // La redirection se fera via le useEffect quand auth.user sera disponible
    setBusy(false);
  }

  const roleLabel =
    detectedRole === "super_admin" ? "Super administrateur"
    : detectedRole === "admin_etablissement" ? "Administrateur d'établissement"
    : detectedRole === "etudiant" ? "Étudiant"
    : null;

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <Logo />
          {step === "otp" && (
            <button
              onClick={() => { setStep("credentials"); setError(""); }}
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
          {step === "credentials" && (
            <>
              <h1 className="font-display text-2xl font-bold">Se connecter</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Saisissez votre email et votre date de naissance. Vous recevrez un code de vérification par email.
              </p>
              <form className="mt-6 space-y-4" onSubmit={sendOtp}>
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
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!email || !date_naissance || busy}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? "Recherche…" : "Recevoir mon code de connexion"}
                </button>
              </form>
            </>
          )}

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
                onClick={sendOtp}
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
