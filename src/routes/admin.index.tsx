import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Vue d'ensemble — Admin CampusLink" }] }),
});

function DashboardPage() {
  const auth = useAuth();
  const [stats, setStats] = useState({ etudiants: 0, annonces: 0, evenements: 0, filieres: 0 });

  useEffect(() => {
    if (!auth.etablissementId) return;
    const eid = auth.etablissementId;
    (async () => {
      const [e, a, ev, f] = await Promise.all([
        supabase.from("etudiants").select("*", { count:"exact", head:true }).eq("etablissement_id", eid),
        supabase.from("annonces").select("*", { count:"exact", head:true }).eq("etablissement_id", eid),
        supabase.from("evenements").select("*", { count:"exact", head:true }).eq("etablissement_id", eid),
        supabase.from("filieres").select("*", { count:"exact", head:true }).eq("etablissement_id", eid),
      ]);
      setStats({ etudiants: e.count ?? 0, annonces: a.count ?? 0, evenements: ev.count ?? 0, filieres: f.count ?? 0 });
    })();
  }, [auth.etablissementId]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">Tableau de bord</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-muted-foreground">Statistiques de votre établissement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Étudiants", v: stats.etudiants, i: "🎓" },
          { l: "Annonces", v: stats.annonces, i: "📣" },
          { l: "Événements", v: stats.evenements, i: "📅" },
          { l: "Filières", v: stats.filieres, i: "📚" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.i}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      {!auth.etablissementId && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Votre compte n'est associé à aucun établissement. Contactez le super administrateur CampusLink.
        </div>
      )}
    </div>
  );
}
