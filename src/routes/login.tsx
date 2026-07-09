import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { claimSuperAdminIfEmpty } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — CampusLink" }] }),
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.loading && auth.user && auth.role) {
      navigate({ to: roleHomePath(auth.role) });
    }
  }, [auth.loading, auth.user, auth.role, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setBusy(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { nom_complet: nom } },
      });
      if (error) { setError(error.message); setBusy(false); return; }
    }
    // Bootstrap : premier compte devient super_admin
    try { await claimSuperAdminIfEmpty(); } catch { /* ignore */ }
    // Le useEffect détectera la session et redirigera
    setBusy(false);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-30 kente-stripe" style={{ maskImage: "linear-gradient(180deg, transparent, black 20%, black 80%, transparent)" }} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo className="[&_span]:text-primary-foreground [&_.text-primary]:text-gold" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Étudiants & Universités</p>
            <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight">Ta scolarité, en un seul endroit.</h1>
            <p className="mt-4 max-w-md text-sm opacity-80">Une seule connexion pour tous les rôles : étudiant, administrateur d'université ou super administrateur CampusLink.</p>
          </div>
          <p className="text-xs opacity-70">© CampusLink — Plateforme du Burkina Faso.</p>
        </div>
      </div>

      <div className="flex flex-col">
        <KenteBar />
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="md:hidden mb-8"><Logo /></div>
            <h2 className="font-display text-3xl font-bold">
              {mode==="login" ? "Bienvenue 👋" : "Créer un compte"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode==="login" ? "Connectez-vous à votre espace CampusLink." : "Créez votre compte administrateur ou super administrateur."}
            </p>

            <form className="mt-8 space-y-4" onSubmit={submit}>
              {mode==="signup" && (
                <Field label="Nom complet"><input value={nom} onChange={e=>setNom(e.target.value)} required className="input" /></Field>
              )}
              <Field label="Email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="input" /></Field>
              <Field label="Mot de passe"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} className="input" /></Field>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-95 disabled:opacity-60">
                {busy ? "..." : (mode==="login" ? "Se connecter" : "Créer mon compte")}
              </button>

              <button type="button" onClick={()=>{setMode(mode==="login"?"signup":"login"); setError("");}} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                {mode==="login" ? "Pas encore de compte ? Créer un compte" : "J'ai déjà un compte"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Vous êtes étudiant ? <Link to="/register" className="font-semibold text-primary hover:underline">Inscription étudiante</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`.input{margin-top:.375rem;width:100%;border-radius:.75rem;border:1px solid hsl(var(--input));background:hsl(var(--surface));padding:.75rem 1rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 4px hsl(var(--primary)/0.2)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium text-foreground">{label}</label>{children}</div>;
}
