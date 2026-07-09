import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Vue d'ensemble — Admin CampusLink" }] }),
});

function DashboardPage() {
  const auth = useAuth();
  const [stats, setStats] = useState({ filieres: 0, niveaux: 0, etudiants: 0, evenements: 0 });

  useEffect(() => {
    if (!auth.etablissementId) return;
    const eid = auth.etablissementId;
    (async () => {
      const [f, n, e, ev] = await Promise.all([
        supabase.from("filieres").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("niveaux").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("etudiants").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
        supabase.from("evenements").select("*", { count: "exact", head: true }).eq("etablissement_id", eid),
      ]);
      setStats({ filieres: f.count ?? 0, niveaux: n.count ?? 0, etudiants: e.count ?? 0, evenements: ev.count ?? 0 });
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
          { l: "Filières", v: stats.filieres, i: "📚", to: "/admin/filieres" },
          { l: "Niveaux", v: stats.niveaux, i: "🎓", to: "/admin/filieres" },
          { l: "Étudiants", v: stats.etudiants, i: "👤", to: "/admin/filieres" },
          { l: "Événements", v: stats.evenements, i: "📅", to: "/admin/events" },
        ].map((s) => (
          <Link key={s.l} to={s.to} className="rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{s.i}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Organisation de votre établissement</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gérez vos filières et niveaux, puis accédez à l'espace de chaque niveau pour importer les étudiants, publier des annonces, créer l'emploi du temps et saisir les notes.
        </p>
        <Link to="/admin/filieres" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Gérer les filières →
        </Link>
      </div>

      {!auth.etablissementId && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Votre compte n'est associé à aucun établissement. Contactez le super administrateur CampusLink.
        </div>
      )}
    </div>
  );
}
