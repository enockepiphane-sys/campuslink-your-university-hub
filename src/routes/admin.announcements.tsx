import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/announcements")({
  component: AnnouncesAdmin,
  head: () => ({ meta: [{ title: "Annonces — Admin CampusLink" }] }),
});

type A = { id:string; titre:string; contenu:string; tag:string|null; urgent:boolean|null; auteur:string|null; created_at:string };

function AnnouncesAdmin() {
  const auth = useAuth(); const eid = auth.etablissementId;
  const [rows, setRows] = useState<A[]>([]);
  const [form, setForm] = useState({ titre:"", contenu:"", tag:"", urgent:false, auteur:"" });

  async function refresh() {
    if (!eid) return;
    const { data } = await supabase.from("annonces").select("*").eq("etablissement_id", eid).order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { refresh(); }, [eid]);

  async function add() {
    if (!eid || !form.titre) return;
    const { error } = await supabase.from("annonces").insert({ ...form, etablissement_id: eid });
    if (error) alert(error.message);
    else { setForm({ titre:"", contenu:"", tag:"", urgent:false, auteur:"" }); refresh(); }
  }
  async function remove(id: string) { await supabase.from("annonces").delete().eq("id", id); refresh(); }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Communication</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Annonces</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvelle annonce</p>
        <div className="grid gap-3">
          <input value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Titre" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.contenu} onChange={e=>setForm({...form,contenu:e.target.value})} placeholder="Contenu" rows={3} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <div className="grid gap-3 md:grid-cols-3">
            <input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="Tag (Scolarité, Cours…)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <input value={form.auteur} onChange={e=>setForm({...form,auteur:e.target.value})} placeholder="Auteur" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.urgent} onChange={e=>setForm({...form,urgent:e.target.checked})} /> Marquer comme urgent</label>
          </div>
          <button onClick={add} className="rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Publier</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucune annonce publiée.</div>
      ) : (
        <div className="space-y-3">
          {rows.map(a => (
            <article key={a.id} className="relative overflow-hidden rounded-2xl bg-surface p-4 shadow-card">
              {a.urgent && <span className="absolute left-0 top-0 h-full w-1 bg-terracotta" />}
              <div className="flex items-center gap-2">
                {a.tag && <Chip tone={a.urgent ? "terracotta" : "default"}>{a.tag}</Chip>}
                {a.urgent && <Chip tone="terracotta">Urgent</Chip>}
                <span className="ml-auto text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</span>
                <button onClick={()=>remove(a.id)} className="text-xs text-red-600">Supprimer</button>
              </div>
              <h2 className="mt-2 font-display text-base font-semibold">{a.titre}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.contenu}</p>
              {a.auteur && <p className="mt-2 text-[11px] text-muted-foreground">Par {a.auteur}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
