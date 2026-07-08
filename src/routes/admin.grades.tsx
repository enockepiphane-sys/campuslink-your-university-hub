import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/grades")({
  component: GradesAdmin,
  head: () => ({ meta: [{ title: "Notes — Admin CampusLink" }] }),
});

type Etudiant = { id:string; nom_complet:string };
type Matiere = { id:string; nom:string; code:string|null };
type Note = { id:string; etudiant_id:string; matiere_id:string; note:number|null; published:boolean|null };

function GradesAdmin() {
  const auth = useAuth(); const eid = auth.etablissementId;
  const [etudiants, setEt] = useState<Etudiant[]>([]);
  const [matieres, setMat] = useState<Matiere[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selMat, setSelMat] = useState("");
  const [newMat, setNewMat] = useState({ nom:"", code:"", credit:0 });

  async function refresh() {
    if (!eid) return;
    const [e, m, n] = await Promise.all([
      supabase.from("etudiants").select("id,nom_complet").eq("etablissement_id", eid).order("nom_complet"),
      supabase.from("matieres").select("id,nom,code").eq("etablissement_id", eid).order("nom"),
      supabase.from("notes").select("id,etudiant_id,matiere_id,note,published"),
    ]);
    setEt(e.data ?? []); setMat(m.data ?? []); setNotes(n.data ?? []);
  }
  useEffect(()=>{ refresh(); }, [eid]);

  async function addMatiere() {
    if (!eid || !newMat.nom) return;
    await supabase.from("matieres").insert({ ...newMat, etablissement_id: eid });
    setNewMat({ nom:"", code:"", credit:0 }); refresh();
  }

  async function setNote(eid_: string, matiere_id: string, value: string) {
    const existing = notes.find(n => n.etudiant_id===eid_ && n.matiere_id===matiere_id);
    const num = value === "" ? null : Number(value);
    if (existing) await supabase.from("notes").update({ note: num }).eq("id", existing.id);
    else await supabase.from("notes").insert({ etudiant_id: eid_, matiere_id, note: num });
    refresh();
  }

  async function togglePublish(id: string, cur: boolean) {
    await supabase.from("notes").update({ published: !cur }).eq("id", id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Académique</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Notes</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvelle matière</p>
        <div className="grid gap-3 md:grid-cols-4">
          <input value={newMat.nom} onChange={e=>setNewMat({...newMat,nom:e.target.value})} placeholder="Nom" className="rounded-lg border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <input value={newMat.code} onChange={e=>setNewMat({...newMat,code:e.target.value})} placeholder="Code" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" value={newMat.credit} onChange={e=>setNewMat({...newMat,credit:Number(e.target.value)})} placeholder="Crédits" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={addMatiere} className="md:col-span-4 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Ajouter</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <p className="font-display text-sm font-semibold">Saisir les notes de :</p>
          <select value={selMat} onChange={e=>setSelMat(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">— Matière —</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}{m.code?` (${m.code})`:""}</option>)}
          </select>
        </div>
        {selMat && etudiants.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="py-2 text-left">Étudiant</th><th className="py-2 text-left">Note /20</th><th className="py-2 text-left">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {etudiants.map(e => {
                const n = notes.find(x => x.etudiant_id===e.id && x.matiere_id===selMat);
                return (
                  <tr key={e.id}>
                    <td className="py-2">{e.nom_complet}</td>
                    <td className="py-2">
                      <input defaultValue={n?.note ?? ""} onBlur={ev=>setNote(e.id, selMat, ev.target.value)} type="number" step="0.25" min="0" max="20" className="w-24 rounded-lg border border-input bg-background px-3 py-1 text-sm" />
                    </td>
                    <td className="py-2">
                      {n ? (
                        <button onClick={()=>togglePublish(n.id, n.published)} className="text-xs">
                          <Chip tone={n.published ? "success" : "muted"}>{n.published ? "Publiée" : "En attente"}</Chip>
                        </button>
                      ) : <Chip tone="muted">—</Chip>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {selMat && etudiants.length===0 && <p className="mt-4 text-sm text-muted-foreground">Aucun étudiant inscrit.</p>}
      </div>
    </div>
  );
}
