import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/events")({
  component: Page,
  head: () => ({ meta: [{ title: "Événements — CampusLink" }] }),
});

type E = { id:string; titre:string; description:string|null; date_evt:string|null; lieu:string|null; categorie:string|null };

function Page() {
  const auth = useAuth();
  const [rows, setRows] = useState<E[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("etablissement_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.etablissement_id) return;
      const { data } = await supabase.from("evenements").select("*").eq("etablissement_id", e.etablissement_id).order("date_evt");
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-6 text-primary-foreground">
        <p className="text-xs opacity-80">Vie universitaire</p>
        <h1 className="font-display text-2xl font-bold">Événements</h1>
      </header>
      <section className="mt-4 space-y-3 px-5">
        {rows.length===0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Aucun événement disponible.</p>
        ) : rows.map(e => (
          <article key={e.id} className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">{e.categorie ?? "Événement"}</p>
            <h2 className="mt-1 font-display text-lg font-semibold">{e.titre}</h2>
            {e.date_evt && <p className="text-xs text-muted-foreground">{new Date(e.date_evt).toLocaleString("fr-FR")}</p>}
            {e.lieu && <p className="text-xs text-muted-foreground">📍 {e.lieu}</p>}
            {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
