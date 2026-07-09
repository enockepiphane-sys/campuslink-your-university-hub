import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inviteEtablissementAdmin } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/platform/admins")({
  component: AdminsPage,
  head: () => ({ meta: [{ title: "Administrateurs — Console CampusLink" }] }),
});

type Etab = { id: string; nom: string };

function AdminsPage() {
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [form, setForm] = useState({ nom_complet: "", email: "", etablissement_id: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").order("nom").then(({ data }) => setEtabs(data ?? []));
  }, []);

  async function invite() {
    setBusy(true);
    setMsg("");
    try {
      await inviteEtablissementAdmin({ data: form });
      setMsg(`✓ Invitation envoyée à ${form.email}. L'administrateur recevra un email pour créer son compte.`);
      setForm({ nom_complet: "", email: "", etablissement_id: "" });
    } catch (e: unknown) {
      setMsg("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Comptes administrateurs</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Inviter un administrateur d'établissement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L'administrateur recevra un email avec un lien sécurisé pour créer son compte et définir son mot de passe.
        </p>
      </div>

      <div className="max-w-xl space-y-3 rounded-2xl border border-border bg-surface p-6">
        <select
          value={form.etablissement_id}
          onChange={(e) => setForm({ ...form, etablissement_id: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Établissement —</option>
          {etabs.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </select>
        <input
          value={form.nom_complet}
          onChange={(e) => setForm({ ...form, nom_complet: e.target.value })}
          placeholder="Nom complet de l'administrateur"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          type="email"
          placeholder="Email professionnel"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          disabled={busy || !form.etablissement_id || !form.email || !form.nom_complet}
          onClick={invite}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Envoi…" : "Envoyer l'invitation"}
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>

      <div className="max-w-xl rounded-2xl border border-dashed border-border bg-muted/30 p-6">
        <h3 className="font-display text-sm font-semibold">Processus de création</h3>
        <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
          <li>1. Vous envoyez l'invitation avec le nom et l'email de l'administrateur</li>
          <li>2. L'administrateur reçoit un email avec un lien sécurisé</li>
          <li>3. Il confirme son identité (nom complet + date de naissance)</li>
          <li>4. Il définit son propre mot de passe</li>
          <li>5. Son compte est activé et il peut accéder à son espace</li>
        </ol>
      </div>
    </div>
  );
}
