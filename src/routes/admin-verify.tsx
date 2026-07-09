import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { verifyAdminOTP } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/admin-verify")({
  component: AdminVerifyPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token_hash: search.token_hash as string | undefined,
    type: search.type as string | undefined,
  }),
  head: () => ({ meta: [{ title: "Vérification du compte — CampusLink" }] }),
});

function AdminVerifyPage() {
  const search = useSearch({ from: "/admin-verify" });
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"loading" | "verify" | "set-password" | "done">("loading");
  const [error, setError] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (auth.loading) return;

    if (auth.user) {
      // Check if already verified
      if (auth.role === "admin_etablissement") {
        navigate({ to: "/admin" });
        return;
      }
      // Show verification form
      setNomComplet(auth.user.user_metadata?.nom_complet || "");
      setStep("verify");
    } else if (search.token_hash && search.type === "invite") {
      // Process the invite token
      supabase.auth.verifyOTP({
        token_hash: search.token_hash,
        type: "invite",
      }).then(({ error: err }) => {
        if (err) {
          setError(err.message);
          setStep("verify");
        }
      });
    } else {
      navigate({ to: "/login" });
    }
  }, [auth.loading, auth.user, auth.role, search.token_hash, search.type, navigate]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.user) return;

    setBusy(true);
    setError("");
    try {
      await verifyAdminOTP({ data: { nom_complet: nomComplet, date_naissance: dateNaissance } });
      setStep("set-password");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
    }
    setBusy(false);
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la définition du mot de passe");
    }
    setBusy(false);
  }

  if (auth.loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/40">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <div className="mx-auto max-w-md px-6 py-12">
        <div className="mb-8"><Logo /></div>

        {step === "loading" && (
          <p className="text-sm text-muted-foreground">Vérification de votre compte…</p>
        )}

        {step === "verify" && (
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mb-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h1 className="font-display text-2xl font-bold">Vérifiez votre identité</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Veuillez confirmer vos informations pour activer votre compte administrateur.
            </p>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <form className="mt-6 space-y-4" onSubmit={handleVerify}>
              <div>
                <label className="text-xs font-medium">Nom complet</label>
                <input
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Date de naissance</label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              <button
                disabled={busy || !nomComplet || !dateNaissance}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Vérification…" : "Confirmer"}
              </button>
            </form>
          </div>
        )}

        {step === "set-password" && (
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
            <button
              onClick={() => setStep("verify")}
              className="mb-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <h1 className="font-display text-2xl font-bold">Définissez votre mot de passe</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>
            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
            <form className="mt-6 space-y-4" onSubmit={handleSetPassword}>
              <div>
                <label className="text-xs font-medium">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 caractères"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
                />
              </div>
              <button
                disabled={busy || password.length < 8}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Enregistrement…" : "Définir le mot de passe"}
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="rounded-3xl border border-border bg-surface p-8 text-center shadow-card">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
            <h1 className="mt-4 font-display text-2xl font-bold">Compte activé !</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre compte administrateur est prêt.
            </p>
            <Link
              to="/admin"
              className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Accéder à l'espace administrateur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
