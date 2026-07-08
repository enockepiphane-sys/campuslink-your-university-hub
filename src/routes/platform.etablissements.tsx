import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform/etablissements")({
  component: EtabsPage,
  head: () => ({ meta: [{ title: "Établissements — Console CampusLink" }] }),
});

type Etab = { id:string; nom:string; email:string|null; telephone:string|null; adresse:string|null; statut:string };

function EtabsPage() {
  const [rows, setRows] = useState<Etab[]>([]);
  const [form, setForm] = useState({ nom:"", email:"", telephone:"", adresse:"", description:"", statut:"actif" });

  async function refresh() {
    const { data } = await supabase.from("etablissements").select("id,nom,email,telephone,adresse,statut").order("nom");
    setRows(data ?? []);
  }
  useEffect(()=>{ refresh(); }, []);

  async function add() {
    if (!form.nom) return;
    const { error } = await supabase.from("etablissements").insert(form);
    if (error) alert(error.message);
    else { setForm({ nom:"", email:"", telephone:"", adresse:"", description:"", statut:"actif" }); refresh(); }
  }
  async function setStatut(id:string, statut:string) {
    await supabase.from("etablissements").update({ statut }).eq("id", id); refresh();
  }
  async function remove(id:string) {
    if (!confirm("Supprimer cet établissement et toutes ses données ?")) return;
    await supabase.from("etablissements").delete().eq("id", id); refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Gestion</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Établissements partenaires</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Ajouter un établissement</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Nom" className="md:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="actif">Actif</option><option value="en_attente">En attente</option><option value="suspendu">Suspendu</option>
          </select>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email officiel" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})} placeholder="Téléphone" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} placeholder="Adresse" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" className="md:col-span-3 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="md:col-span-3 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Créer l'établissement</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Aucun établissement.</div>
        : <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr><th className="px-5 py-3 text-left">Nom</th><th className="px-5 py-3 text-left">Contact</th><th className="px-5 py-3 text-left">Statut</th><th className="px-5 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="px-5 py-3">
                  <p className="font-semibold">{r.nom}</p>
                  {r.adresse && <p className="text-xs text-muted-foreground">{r.adresse}</p>}
                </td>
                <td className="px-5 py-3 text-xs">{r.email ?? "—"}<br/>{r.telephone ?? ""}</td>
                <td className="px-5 py-3">
                  <select value={r.statut} onChange={e=>setStatut(r.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                    <option value="actif">Actif</option><option value="en_attente">En attente</option><option value="suspendu">Suspendu</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-right"><button onClick={()=>remove(r.id)} className="text-xs text-red-600">Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
