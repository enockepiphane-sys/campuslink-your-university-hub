import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo, KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHomePath } from "@/lib/use-auth";
import { claimSuperAdminIfEmpty } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/super-admin-acces")({
  component: SuperAdminAccessPage,
  head: () => ({ meta: [
    { title: "Accès Super Administrateur — CampusLink" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function SuperAdminAccessPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
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
    e.preventDefault();
    setBusy(true); setError("");

    const { data: existingRole } = await supabase.rpc("email_role", { _email: email });

    if (mode === "signup") {
      // Autorisé uniquement si aucun super_admin n'existe encore (bootstrap)
      // OU si l'email est déjà pré-inscrit dans super_admins.
      if (existingRole && existingRole !== "super_admin") {
        setError("Cet email est déjà utilisé par un autre rôle.");
        setBusy(false); return;
      }
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { nom_complet: nom } },
      });
      if (error) { setError(error.message); setBusy(false); return; }
    } else {
      if (existingRole !== "super_admin") {
        setError("Accès réservé. Cet email n'est pas reconnu comme Super Administrateur.");
        setBusy(false); return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setBusy(false); return; }
    }
    try { await claimSuperAdminIfEmpty(); } catch { /* ignore */ }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <KenteBar />
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <Logo />
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Accès restreint</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Super Administrateur</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" ? "Espace réservé à l'équipe CampusLink." : "Bootstrap du premier super administrateur."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <input value={nom} onChange={e=>setNom(e.target.value)} required placeholder="Nom complet" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            )}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="Mot de passe" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background disabled:opacity-60">
              {busy ? "..." : (mode === "login" ? "Se connecter" : "Créer le compte")}
            </button>
            <button type="button" onClick={()=>{setMode(mode==="login"?"signup":"login"); setError("");}} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
              {mode === "login" ? "Premier accès ? Créer le compte" : "J'ai déjà un compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
