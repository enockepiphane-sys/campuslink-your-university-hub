import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/platform/partenariats")({
  component: PartenariatsPage,
  head: () => ({ meta: [{ title: "Demandes de partenariat — Console CampusLink" }] }),
});

type D = { id:string; nom_etablissement:string; responsable:string; email:string; telephone:string|null; message:string|null; statut:string|null; created_at:string };

function PartenariatsPage() {
  const [rows, setRows] = useState<D[]>([]);
  async function refresh() {
    const { data } = await supabase.from("demandes_partenariat").select("*").order("created_at",{ascending:false});
    setRows(data ?? []);
  }
  useEffect(()=>{ refresh(); }, []);
  async function setStatut(id:string, statut:string){ await supabase.from("demandes_partenariat").update({statut}).eq("id",id); refresh(); }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Boîte de réception</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Demandes de partenariat</h1>
      </div>
      {rows.length===0 ? <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Aucune demande pour le moment.</p>
      : <div className="space-y-3">
        {rows.map(d => (
          <div key={d.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-semibold">{d.nom_etablissement}</p>
                <p className="text-xs text-muted-foreground">{d.responsable} · {d.email}{d.telephone?` · ${d.telephone}`:""}</p>
              </div>
              <Chip tone={d.statut==="traite" ? "success" : "muted"}>{d.statut ?? "nouveau"}</Chip>
            </div>
            {d.message && <p className="mt-3 text-sm text-muted-foreground">{d.message}</p>}
            <div className="mt-3 flex gap-2 text-xs">
              <button onClick={()=>setStatut(d.id,"traite")} className="rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Marquer comme traité</button>
              <button onClick={()=>setStatut(d.id,"rejete")} className="rounded-md border border-border px-3 py-1.5">Rejeter</button>
              <span className="ml-auto text-muted-foreground">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
