import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/events")({
  component: EventsAdmin,
  head: () => ({ meta: [{ title: "Événements — Admin CampusLink" }] }),
});

type E = { id:string; titre:string; description:string|null; date_evt:string|null; lieu:string|null; categorie:string|null };

function EventsAdmin() {
  const auth = useAuth(); const eid = auth.etablissementId;
  const [rows, setRows] = useState<E[]>([]);
  const [form, setForm] = useState({ titre:"", description:"", date_evt:"", lieu:"", categorie:"" });

  async function refresh() {
    if (!eid) return;
    const { data } = await supabase.from("evenements").select("*").eq("etablissement_id", eid).order("date_evt", { ascending: true });
    setRows(data ?? []);
  }
  useEffect(()=>{ refresh(); }, [eid]);

  async function add() {
    if (!eid || !form.titre) return;
    const { error } = await supabase.from("evenements").insert({ ...form, etablissement_id: eid, date_evt: form.date_evt||null });
    if (error) alert(error.message);
    else { setForm({ titre:"", description:"", date_evt:"", lieu:"", categorie:"" }); refresh(); }
  }
  async function remove(id:string){ await supabase.from("evenements").delete().eq("id",id); refresh(); }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Vie universitaire</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Événements</h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 font-display text-sm font-semibold">Nouvel événement</p>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Titre" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})} placeholder="Catégorie" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows={2} className="md:col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input type="datetime-local" value={form.date_evt} onChange={e=>setForm({...form,date_evt:e.target.value})} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.lieu} onChange={e=>setForm({...form,lieu:e.target.value})} placeholder="Lieu" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={add} className="md:col-span-2 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">Créer l'événement</button>
        </div>
      </div>

      {rows.length===0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucun événement.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map(e => (
            <div key={e.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">{e.categorie ?? "Événement"}</p>
                  <h2 className="mt-1 font-display text-lg font-semibold">{e.titre}</h2>
                  {e.date_evt && <p className="text-xs text-muted-foreground">{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
                  {e.lieu && <p className="text-xs text-muted-foreground">📍 {e.lieu}</p>}
                </div>
                <button onClick={()=>remove(e.id)} className="text-xs text-red-600">×</button>
              </div>
              {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
