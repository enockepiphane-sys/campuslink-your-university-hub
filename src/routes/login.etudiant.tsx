import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { checkStudentEmailExists } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/login/etudiant")({
  component: StudentLogin,
  head: () => ({ meta: [{ title: "Connexion étudiant — CampusLink" }] }),
});

function StudentLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);

  if (!auth.loading && auth.user && auth.role === "etudiant") {
    navigate({ to: roleHomePath("etudiant") });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotRegistered(false);

    // Check if email exists in auth.users
    try {
      const result = await checkStudentEmailExists({ data: { email } });
      if (!result.exists) {
        setNotRegistered(true);
        setBusy(false);
        return;
      }
    } catch {
      // If check fails, proceed with login attempt anyway
    }

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      setError(signInErr.message);
      setBusy(false);
      return;
    }

    if (data.user) {
      navigate({ to: "/app" });
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Link to="/" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Retour
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card md:p-8">
          <h1 className="font-display text-2xl font-bold">Connexion étudiant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Saisissez votre email et votre mot de passe pour accéder à votre espace.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre.email@gmail.com" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
            {notRegistered && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                <p>Aucun compte étudiant trouvé avec cet email. Vous devez d'abord vous inscrire.</p>
                <Link to="/login/etudiant/inscription" className="mt-2 inline-block rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">S'inscrire →</Link>
              </div>
            )}
            <button type="submit" disabled={!email || !password || busy} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-xs text-muted-foreground">Pas encore de compte ?</p>
            <Link to="/login/etudiant/inscription" className="mt-2 inline-block rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
