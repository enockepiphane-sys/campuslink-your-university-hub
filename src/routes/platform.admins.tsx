import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createEtablissementAdmin } from "@/lib/admin-account.functions";

export const Route = createFileRoute("/platform/admins")({
  component: AdminsPage,
  head: () => ({ meta: [{ title: "Administrateurs — Console CampusLink" }] }),
});

type Etab = { id:string; nom:string };

function AdminsPage() {
  const [etabs, setEtabs] = useState<Etab[]>([]);
  const [form, setForm] = useState({ nom_complet:"", email:"", password:"", etablissement_id:"" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("etablissements").select("id,nom").order("nom").then(({data})=>setEtabs(data??[]));
  }, []);

  async function create() {
    setBusy(true); setMsg("");
    try {
      await createEtablissementAdmin({ data: form });
      setMsg(`✓ Administrateur créé pour ${form.email}`);
      setForm({ nom_complet:"", email:"", password:"", etablissement_id:"" });
    } catch (e: unknown) {
      setMsg("Erreur : " + (e instanceof Error ? e.message : "inconnue"));
    }
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Comptes administrateurs</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Créer un administrateur d'établissement</h1>
      </div>

      <div className="max-w-xl space-y-3 rounded-2xl border border-border bg-surface p-6">
        <select value={form.etablissement_id} onChange={e=>setForm({...form,etablissement_id:e.target.value})} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="">— Établissement —</option>
          {etabs.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
        <input value={form.nom_complet} onChange={e=>setForm({...form,nom_complet:e.target.value})} placeholder="Nom complet" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="Email professionnel" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="text" placeholder="Mot de passe temporaire (8+ caractères)" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button disabled={busy||!form.etablissement_id||!form.email||form.password.length<8} onClick={create} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Création…" : "Créer le compte administrateur"}
        </button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>
    </div>
  );
}
