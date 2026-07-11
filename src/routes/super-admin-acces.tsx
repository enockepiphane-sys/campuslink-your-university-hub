import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KenteBar } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { checkSuperAdminEmail } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/super-admin-acces")({
  component: SuperAdminAccess,
  head: () => ({ meta: [{ title: "Accès — CampusLink" }] }),
});

function SuperAdminAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      // First check if email belongs to a super_admin
      const result = await checkSuperAdminEmail({ data: { email } });

      if (!result.is_super_admin) {
        setError("Accès non autorisé.");
        setBusy(false);
        return;
      }

      // Proceed with password verification
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

      if (signInErr) {
        setError("Accès non autorisé.");
        setBusy(false);
        return;
      }

      navigate({ to: "/platform" });
    } catch {
      setError("Accès non autorisé.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <KenteBar />
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          <h1 className="font-display text-xl font-bold">Accès</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </div>
            {error && <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}
            <button type="submit" disabled={busy || !email || !password} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? "Vérification…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
