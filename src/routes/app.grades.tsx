import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Chip } from "@/components/campus/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/grades")({
  component: Page,
  head: () => ({ meta: [{ title: "Mes notes — CampusLink" }] }),
});

type Row = { id:string; note:number|null; matiere: { nom:string; code:string|null; credit:number|null }|null };

function Page() {
  const auth = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: et } = await supabase.from("etudiants").select("id").eq("user_id", auth.user!.id).maybeSingle();
      if (!et) return;
      const { data } = await supabase.from("notes")
        .select("id,note,matiere:matieres(nom,code,credit)")
        .eq("etudiant_id", et.id).eq("published", true);
      setRows((data as unknown as Row[]) ?? []);
    })();
  }, [auth.user]);

  const moy = rows.filter(r=>r.note!=null).reduce((a,r)=>a+(r.note??0),0) / Math.max(1, rows.filter(r=>r.note!=null).length);

  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-8 text-primary-foreground">
        <p className="text-xs opacity-80">Résultats académiques</p>
        <h1 className="font-display text-2xl font-bold">Mes notes</h1>
        {rows.length>0 && (
          <div className="mt-3 rounded-2xl bg-white/10 p-3">
            <p className="text-[10px] uppercase tracking-widest opacity-70">Moyenne</p>
            <p className="font-display text-3xl font-bold">{moy.toFixed(2)}<span className="text-base opacity-70">/20</span></p>
          </div>
        )}
      </header>

      <section className="mt-4 space-y-2 px-5">
        {rows.length===0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Aucune note disponible.</p>
        ) : rows.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-xl bg-surface p-3 shadow-card">
            <div>
              <p className="text-sm font-semibold">{r.matiere?.nom ?? "—"}</p>
              <p className="text-[11px] text-muted-foreground">{r.matiere?.code} · {r.matiere?.credit ?? 0} crédits</p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold">{r.note ?? "—"}<span className="text-xs opacity-60">/20</span></p>
              <Chip tone="success">Publiée</Chip>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
