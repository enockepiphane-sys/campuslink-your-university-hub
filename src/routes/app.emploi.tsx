import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/app/emploi")({
  component: EmploiPage,
  head: () => ({ meta: [{ title: "Emploi du temps — CampusLink" }] }),
});

type E = { id: string; matiere: string; jour: string; heure_debut: string | null; heure_fin: string | null; salle: string | null; enseignant: string | null };
const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function EmploiPage() {
  const auth = useAuth();
  const [rows, setRows] = useState<E[]>([]);

  useEffect(() => {
    if (!auth.user) return;
    (async () => {
      const { data: e } = await supabase.from("etudiants").select("filiere_id,niveau_id").eq("user_id", auth.user!.id).maybeSingle();
      if (!e?.filiere_id || !e?.niveau_id) return;
      const { data } = await supabase.from("emplois_du_temps")
        .select("id,matiere,jour,heure_debut,heure_fin,salle,enseignant")
        .eq("filiere_id", e.filiere_id)
        .eq("niveau_id", e.niveau_id)
        .order("heure_debut");
      setRows(data ?? []);
    })();
  }, [auth.user]);

  return (
    <div className="pb-4">
      <header className="bg-primary px-5 pt-6 pb-6 text-primary-foreground">
        <p className="text-xs opacity-80">Organisation hebdomadaire</p>
        <h1 className="font-display text-2xl font-bold">Emploi du temps</h1>
        <Link to="/app" className="mt-2 inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Accueil
        </Link>
      </header>
      <section className="mt-4 space-y-3 px-5">
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Aucun cours programmé pour votre niveau.</p>
        ) : jours.map((j) => {
          const jrows = rows.filter((r) => r.jour === j);
          if (jrows.length === 0) return null;
          return (
            <div key={j} className="rounded-2xl bg-surface p-4 shadow-card">
              <p className="mb-2 font-display text-sm font-semibold text-terracotta">{j}</p>
              <div className="space-y-1">
                {jrows.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg bg-background p-2 text-xs">
                    <span className="font-mono text-muted-foreground">{r.heure_debut ?? "?"}–{r.heure_fin ?? "?"}</span>
                    <span className="font-semibold text-sm">{r.matiere}</span>
                    {r.salle && <span className="text-muted-foreground">📍 {r.salle}</span>}
                    {r.enseignant && <span className="text-muted-foreground">👤 {r.enseignant}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
