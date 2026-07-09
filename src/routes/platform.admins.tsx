import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createEtablissementAdmin } from "@/lib/unified-auth.functions";

export const Route = createFileRoute("/platform/admins")({
  component: AdminsPage,
  head: () => ({ meta: [{ title: "Administrateurs — Console CampusLink" }] }),
});

type Etab = { id: string; nom: string };
type Admin = { id: string; email: string; nom_complet: string; date_naissance: string; statut: string; etablissement_id: string };

function AdminsPage() {
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState({ nom_complet: "", email: "", date_naissance: "", etablissement_id: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").order("nom").then(({ data }) => setEtabs(data ?? []));
    refreshAdmins();
  }, []);

  async function refreshAdmins() {
    const { data } = await supabase.from("admins").select("id,email,nom_complet,date_naissance,statut,etablissement_id").order("nom_complet");
    setAdmins(data ?? []);
  }

  async function create() {
    setBusy(true);
    setMsg("");
    try {
      await createEtablissementAdmin({ data: form });
      setMsg(`✓ Administrateur créé. ${form.email} pourra se connecter avec son email et sa date de naissance.`);
      setForm({ nom_complet: "", email: "", date_naissance: "", etablissement_id: "" });
      refreshAdmins();
    } catch (e: unknown) {
      setMsg("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    }
    setBusy(false);
  }

  const etabName = (id: string) => etabs.find((e) => e.id === id)?.nom ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Comptes administrateurs</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Créer un administrateur d'établissement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          L'administrateur se connectera avec son email et sa date de naissance, puis recevra un code OTP par email.
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
            <option key={e.id} value={e.id}>{e.nom}</option>
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
        <input
          type="date"
          value={form.date_naissance}
          onChange={(e) => setForm({ ...form, date_naissance: e.target.value })}
          placeholder="Date de naissance"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          disabled={busy || !form.etablissement_id || !form.email || !form.nom_complet || !form.date_naissance}
          onClick={create}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Création…" : "Créer l'administrateur"}
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <p className="border-b border-border p-4 font-display text-sm font-semibold">Administrateurs existants</p>
        {admins.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucun administrateur créé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Nom</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Établissement</th>
                <th className="px-5 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-semibold">{a.nom_complet}</td>
                  <td className="px-5 py-3 text-xs">{a.email}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{etabName(a.etablissement_id)}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">{a.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
